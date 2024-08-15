
library(tidyr)
library(dplyr)
library(rstatix)
library(ggplot2)
library(see)
library(ggpubr)
library(stringr)


load('../data/main2/main2.Rdata')

#### Helper functions ####
make_plot <- function(data, val_col, plt_title) {
  plt <- ggplot(data, aes(x = condition, y = !!sym(val_col), fill = condition)) +
    geom_violinhalf(position = position_dodge(width = 0.75), alpha = 0.5) +
    stat_summary(fun = "mean",
                 geom = "crossbar", 
                 width = 0.5,
                 colour = "red") +
    geom_jitter(position = position_jitter(width = 0.1), size = 1, alpha = 0.7) +
    geom_boxplot(width = 0.2, position = position_nudge(x=-0.15)) +
    #geom_point(data = mean_data, aes(y = value), color = 'black', shape = 95, size = 10) +
    theme_minimal() +
    labs(y = "", x = "", title = plt_title)
  return(plt)
}
###########################

#### Fusion rate ####
explore_data = df.tw %>%
  filter(task_type=='task') %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)

make_plot(explore_data, 'fusion_rate', 'Fusion rate')

explore_data %>% 
  group_by(condition) %>%
  summarise(fusion_rate_mean=mean(fusion_rate))


# Stats
explore_data_task = df.tw %>%
  filter(task_type=='task') %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task_id, condition) %>%
  summarise(fusion_rate=sum(explore)/n()) %>%
  ungroup()
res.aov <- anova_test(
  data = explore_data_task, dv = fusion_rate, wid = id,
  between = condition,
  within = task_id,
)
get_anova_table(res.aov)


#### Over time ####
explore_all_data = df.tw %>%
  select(id, condition, task_type, task_id, action) %>%
  mutate(is_fusion=as.numeric(action=='F')) %>%
  group_by(condition, task_id, task_type, id) %>%
  summarise(fusion_rate=sum(is_fusion)/n()) %>%
  group_by(condition, task_id, task_type) %>%
  summarise(se=sd(fusion_rate)/sqrt(n()), mean=mean(fusion_rate))
ggplot(explore_all_data, aes(x=task_id, y=mean, color=condition)) +
  geom_line() +
  geom_ribbon(aes(ymin=mean-se, ymax=mean+se, fill=condition), alpha=0.2, colour=NA) +
  theme_bw() +
  facet_grid(~task_type) +
  theme(text = element_text(size = 20))


#### Score and levels ####
score_data = df.tw %>%
  filter(task_type=='task', step_id==10) %>%
  select(condition, id, task_id, total_score)

make_plot(score_data, 'total_score', 'Total score') +
  theme(legend.position = 'bottom')


df_items = df.tw %>%
  filter(task_type=='task') %>%
  group_by(id, task_id, condition) %>%
  summarise(score=max(immediate_score)) %>%
  mutate(item_level = round(log(score/100, 1.5)))
make_plot(df_items, 'item_level', 'Highest item level') +
  theme(legend.position = 'bottom')


#### Switch once ####
# Back and forth
concat_str <- function(vec) {
  s = ''
  for (v in vec) s = paste0(s, v)
  return(s)
}
compute_bnf <- function(pid, tid) {
  dt = df.tw %>% 
    filter(task_type=='task' & id==pid & task_id==tid)
  actions = concat_str(dt$action)
  if (str_count(actions,'EF') == 0) {
    switch_d = str_count(actions,'F')
  } else {
    switch_d = -1
  }
  return(switch_d)
}
df_switch = read.csv(text='id,task,switch_day')
for (i in df.sw$id) {
  for (t in 1:5) {
    d = compute_bnf(i, t)
    df_switch = rbind(df_switch, data.frame(id=i, task=t, switch_day=d))
  }
}
# add condition
conds_info = df.sw %>% select(id, condition)
switch_data = df_switch %>% left_join(conds_info, by='id')

switch_data %>%
  mutate(is_switch_once=as.numeric(switch_day>=0)) %>%
  group_by(condition) %>%
  summarise(switch_once = sum(is_switch_once)/n())

switch_data %>%
  filter(switch_day > -1) %>%
  ggplot(aes(x=switch_day, fill=condition))+
  geom_bar() +
  labs(x='Switch step', y='Number of rounds') +
  scale_x_continuous( breaks = seq(0,10))+
  #scale_fill_manual(values=cond_colors) +
  facet_grid(condition ~ .) +
  theme_bw() +
  theme(text = element_text(size=20), legend.position = 'none')


switch_data %>%
  filter(switch_day > -1) %>%
  ggplot(aes(x = switch_day, fill = condition)) +
  geom_bar(position = "identity", alpha = 0.5) +  # position and transparency
  labs(x = 'Switch step', y = 'Number of rounds') +
  scale_x_continuous(breaks = seq(0, 10)) +
  # scale_fill_manual(values = cond_colors) +
  theme(text = element_text(size = 20))




#### Match rate ####

shapes <- c("diamond", "square", "circle", "triangle")
shape_pattern <- paste(shapes, collapse = "|")

fusion_data = df.tw %>% filter(action=='F')
fusion_data$combo_shape = sapply(fusion_data$item_selection, function(x) {
  paste(str_extract_all(x, shape_pattern)[[1]], collapse = "-")
})


sort_shapes <- function(shape_string) {
  sorted_shapes <- sapply(strsplit(shape_string, "-"), function(x) paste(sort(x), collapse = "-"))
  return(sorted_shapes)
}
fusion_data$highCombo = sort_shapes(fusion_data$highCombo)


fusion_data = fusion_data %>%
  select(id, condition, task_type, task_id, highCombo, step_id, combo_shape)

fusion_match = fusion_data %>%
  filter(task_type=='task') %>%
  mutate(is_high=as.numeric(highCombo==combo_shape)) %>%
  group_by(task_type, task_id,condition, id) %>%
  summarise(is_high = sum(is_high)/n()) 
make_plot(fusion_match, 'is_high', 'Match high combo')

fusion_types = fusion_data %>%
  group_by(id, condition, task_type, task_id) %>%
  summarise(unique_combo_shapes = n_distinct(combo_shape))
ggplot(fusion_types, aes(x = condition, y = unique_combo_shapes)) +
  stat_summary(fun = "mean",
               geom = "crossbar", 
               width = 0.5,
               colour = "red") +
  geom_jitter( position = position_jitter(width = 0.1), size = 1, alpha = 0.7) +
  #geom_boxplot(width = 0.2, position = position_nudge(x=-0.15)) +
  #geom_point(data = mean_data, aes(y = value), color = 'black', shape = 95, size = 10) +
  theme_minimal() +
  labs(y = "", x = "", title = 'Unique combos attempted') +
  theme(legend.position = 'none') +
  facet_grid(~task_type)



#### Actions after first successful combination ####
df.tw$highCombo = sort_shapes(df.tw$highCombo)
df = df.tw %>% select(id, condition, task_type, task_id, step_id, action, feedback)
success_data = df %>%
  group_by(id, condition, task_type, task_id) %>%
  mutate(feedback_index = ifelse(feedback == 1, row_number(), 100)) %>%
  summarise(first_feedback_index = min(feedback_index))

success_data %>% 
  mutate(ever_success = as.numeric(first_feedback_index<100)) %>%
  group_by(condition, task_type) %>%
  summarise(ever_success = sum(ever_success)/n())
  

successed = success_data %>%
  filter(first_feedback_index < 100) %>%
  mutate(step_id=first_feedback_index) %>%
  left_join(df.tw, by=c("id", "condition", "task_type", "task_id", "step_id")) %>%
  select(id, condition, task_type, task_id, step_id, action, feedback, item_selection, highCombo)
successed$combo_shape = sapply(successed$item_selection, function(x) {
  paste(str_extract_all(x, shape_pattern)[[1]], collapse = "-")
})

after_successed = success_data %>%
  filter(first_feedback_index < 100) %>%
  mutate(step_id=first_feedback_index+1) %>%
  filter(step_id<11) %>%
  left_join(df.tw, by=c("id", "condition", "task_type", "task_id", "step_id")) %>%
  select(id, condition, task_type, task_id, action, item_selection, highCombo)
after_successed$combo_shape = sapply(after_successed$item_selection, function(x) {
  paste(str_extract_all(x, shape_pattern)[[1]], collapse = "-")
})

successed_combo = successed %>%
  select(id, condition, task_type, task_id, prev_combo=combo_shape)
after_successed = after_successed %>%
  left_join(successed_combo, by=c("id", "condition", "task_type", "task_id"))


after_successed %>%
  mutate(switch_to_extract=as.numeric(action=='E')) %>%
  group_by(condition, task_type) %>%
  summarise(switch_to_extract=sum(switch_to_extract)/n())

after_successed %>%
  filter(action=='F') %>%
  mutate(repeat_prev_combo=as.numeric(combo_shape==prev_combo)) %>%
  group_by(condition, task_type) %>%
  summarise(repeat_prev_combo=sum(repeat_prev_combo)/n())


#### Subjective p ####

























