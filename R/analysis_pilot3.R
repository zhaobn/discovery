
library(tidyr)
library(dplyr)
library(ggplot2)
library(see)
library(ggpubr)
library(stringr)

library(viridis)

load('../data/pilot-exp/pilotDen.Rdata')

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

# total scores
make_plot(df.sw, 'total_score', 'Total score')

# total time
time_converted = df.sw %>%
  mutate(task_time=round(task_duration/60000))
make_plot(time_converted, 'task_time', 'Task time')
# other subjective rating
make_plot(df.sw, 'engagement', 'Self-reported engagement')
make_plot(df.sw, 'difficulty', 'Self-reported difficulty')

# fusion rate
explore_data = df.tw %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)
make_plot(explore_data, 'fusion_rate', 'Fusion rate')

# Fusion rate per task
explore_task = df.tw %>%
  group_by(condition, id, task_id) %>%
  summarise(fusion_rate=sum(action=='F')/n()) %>%
  group_by(condition, task_id) %>%
  summarise(se=sd(fusion_rate)/sqrt(n()), fusion_rate=sum(fusion_rate)/n())

ggplot(explore_task, aes(x=task_id, y=fusion_rate, color=condition)) +
  geom_line() +
  geom_ribbon(aes(ymin=fusion_rate-se, ymax=fusion_rate+se, fill=condition), alpha=0.2, color=NA) +
  theme_bw()


# Fusion rate Experiment 1
df.sw.p = df.sw
df.tw.p = df.tw

load('../data/main1/main1.Rdata')
df.sw.exp1 = df.sw
df.tw.exp1 = df.tw
df.iw.exp1 = df.iw

df.sw = df.sw.p
df.tw = df.tw.p

cond_levels = c('hh', 'hl', 'lh', 'll')
cond_labels = c('high p high w', 'high p low w', 'low p high w', 'low p low w')
df.tw.exp1 = df.tw.exp1 %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
explore_task_exp1 = df.tw.exp1 %>%
  group_by(condition, id, task) %>%
  summarise(fusion_rate=sum(action=='F')/n()) %>%
  group_by(condition, task) %>%
  summarise(se=sd(fusion_rate)/sqrt(n()), fusion_rate=sum(fusion_rate)/n())
ggplot(explore_task_exp1, aes(x=task, y=fusion_rate, color=condition)) +
  geom_line() +
  geom_ribbon(aes(ymin=fusion_rate-se, ymax=fusion_rate+se, fill=condition), alpha=0.2, color=NA) +
  theme_bw()


# Choose the right one
shapes <- c("diamond", "square", "circle", "triangle")
shape_pattern <- paste(shapes, collapse = "|")

fusion_data = df.tw %>% filter(action=='F')


fusion_data$combo_shape = sapply(fusion_data$item_selection, function(x) {
  paste(str_extract_all(x, shape_pattern)[[1]], collapse = "-")
})
fusion_data = fusion_data %>%
  mutate(is_high=as.numeric(highCombo==combo_shape)) 
make_plot(fusion_data, 'is_high', 'Match high combo') + theme(legend.position = 'bottom')

fusion_per_task = fusion_data %>%
  group_by(condition, id, task_id) %>%
  summarise(match_rate=sum(is_high)/n()) %>%
  group_by(condition, task_id) %>%
  summarise(se=sd(match_rate)/sqrt(n()), match_rate=sum(match_rate)/n())
ggplot(fusion_per_task, aes(x=task_id, y=match_rate, color=condition)) +
  geom_line() +
  geom_ribbon(aes(ymin=match_rate-se, ymax=match_rate+se, fill=condition), alpha=0.2, color=NA) +
  theme_bw()


# switch points
concat_str <- function(vec) {
  s = ''
  for (v in vec) s = paste0(s, v)
  return(s)
}
compute_bnf <- function(pid, tid) {
  dt = df.tw %>% filter(id==pid & task_id==tid)
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
  for (t in 1:7) {
    d = compute_bnf(i, t)
    df_switch = rbind(df_switch, data.frame(id=i, task=t, switch_day=d))
  }
}
# add condition
conds_info = df.sw %>% select(id, condition)
plt_swith = df_switch %>% left_join(conds_info, by='id') 

concat_str <- function(vec) {
  s = ''
  for (v in vec) s = paste0(s, v)
  return(s)
}
compute_bnf <- function(pid, tid) {
  dt = df.tw %>% filter(id==pid & task_id==tid)
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
  for (t in 1:7) {
    d = compute_bnf(i, t)
    df_switch = rbind(df_switch, data.frame(id=i, task=t, switch_day=d))
  }
}
# add condition
conds_info = df.sw %>% select(id, condition)
plt_swith = df_switch %>% left_join(conds_info, by='id') 
# plot
plt_swith %>%
  filter(switch_day > -1) %>%
  ggplot(aes(x=switch_day, fill=condition))+
  geom_bar() +
  labs(x='Switch step', y='Number of rounds') +
  scale_x_continuous( breaks = seq(0,10))+
  facet_grid(condition~task) +
  theme_bw() +
  theme(legend.position = 'none')



# item levels
df_items = df.tw %>%
  group_by(id, task_id, condition) %>%
  summarise(score=max(immediate_score)) %>%
  mutate(item_level = round(log(score/100, 1.5)))
make_plot(df_items, 'item_level', 'Highest item level') +
  theme(legend.position = 'bottom')
df_items_filtered = df_items %>%
  filter(item_level>=0)

viridis_palette <- viridis(nrow(df.sw))
df_items_filtered$id = as.factor(df_items_filtered$id)
ggplot(df_items_filtered, aes(x=task_id, y=item_level)) +
  stat_summary(fun = mean, geom = "bar", position = position_dodge(width = 0.9), width = 0.7) +
  geom_point(aes(color=id), position = position_jitter(width = 0.1, height = 0), alpha = 0.6)+
  scale_color_manual(values = viridis_palette) +
  geom_line(aes(x=task_id, y=item_level, color=id), alpha=0.4) +
  facet_wrap(~condition)+
  theme_bw() +
  labs(x = "Task", y = "Highest item level", fill='') +
  theme(legend.position = 'none')




