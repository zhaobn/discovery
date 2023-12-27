
library(tidyr)
library(dplyr)
library(stringr)
library(ggplot2)
library(MoMAColors)
load('../data/main1/main1.Rdata')

theme_set(theme_bw())
cond_levels = c('hh', 'hl', 'lh', 'll')
cond_labels = c('high prob\nhigh reward', 'high prob\nlow reward', 'low prob\nhigh reward', 'low prob\nlow reward')
cond_labels_long = c('high prob, high reward', 'high prob, low reward', 'low prob, high reward', 'low prob, low reward')
cond_colors = moma.colors("VanGogh", 4)


#### demographics ####
hist(df.sw$age)
df.sw %>% summarise(mean(age), sd(age))


df.sw %>%
  mutate(is_female=sex=='female') %>%
  summarise(mean(is_female))


hist(df.sw$task_duration)
df.sw %>%
  mutate(task_time=task_duration/60000) %>%
  summarise(mean(task_time), sd(task_time))


# Does instruction fois matter?
hist(df.sw$instruction, breaks=14)
df_instruct = df.sw %>%
  select(id, condition, age, instruction, total_score, task_duration) %>%
  mutate(task_duration=round(task_duration/60000), is_many=instruction>3)
ggplot(df_instruct, aes(x=is_many, y=total_score)) + geom_boxplot() + facet_grid(~condition)


#### exploration rates ####

# Per person per task
df_explore = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n())
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))

ggplot(df_explore, aes(x=condition, y=explore_rate, fill=condition)) +
  geom_violin(alpha=0.5) +
  geom_boxplot(width=0.2) +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2), alpha=0.2) +
  stat_summary(fun = "mean", geom = "point", color = "grey", size=5) +
  scale_fill_manual(values=cond_colors) +
  labs(x='', y='prop. fusion attempts') +
  theme(legend.position = 'none',  legend.text = element_text(margin = margin(t = 12)),
        text = element_text(size=20))


# Per step per condition
df_step = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, step, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
pstat_step = df_step %>%
  group_by(step, condition) %>%
  summarise(se=sd(explore_rate)/sqrt(n()), explore_rate=mean(explore_rate))
ggplot(pstat_step, aes(x=step, y=explore_rate, group=condition)) +
  geom_line(aes(color=condition)) +
  geom_ribbon(aes(y = explore_rate, ymin = explore_rate-se, ymax = explore_rate + se, fill=condition), alpha = .2) +
  scale_color_manual(values=cond_colors) +
  scale_fill_manual(values=cond_colors) +
  theme(legend.position = 'right',  
        legend.text = element_text(margin = margin(t = 12)),
        text = element_text(size=20))
ggplot(df_step, aes(x = step, y = explore_rate, group=id)) +
  geom_line(alpha = .5, aes(color=id)) +
  geom_line(data = pstat_step, aes(x=step, y=explore_rate, group=1), alpha = .8, size = 2) +
  facet_wrap(~condition) +
  theme(strip.background =element_rect(fill="white"))



#### other ####


# Total score
# df_score_base = data.frame(condition=c('hh', 'hl', 'lh', 'll'), base=c(1, 150, 150, 500)) %>%
#   mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))

df_score = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(score=max(total_score))
pstat_score = df_score %>%
  group_by(condition) %>%
  summarise(se=sd(score)/sqrt(n()), score=mean(score)) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
ggplot(pstat_score, aes(x=condition, y=score)) +
  geom_bar(stat = "identity", fill='dodgerblue') +
  geom_errorbar(aes(ymin=score-se, ymax=score+se), width=.2) +
  #geom_bar(data=df_score_base, stat = "identity", aes(x=condition, y=base), fill='red')
  labs(x='', y='score per task') +
  #geom_jitter(data=df_score)
  theme(text = element_text(size=20))


# Highest item level
df_items = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(score=max(immediate_score)) %>%
  mutate(item_level = ifelse(score < 1, 0,
                             round(case_when(
                               condition=='hl'~ log(score/150, 1.5),
                               condition=='hh'~ log(score, 3),
                               condition=='lh'~ log(score/150, 3),
                               condition=='ll'~ log(score/500, 1.5),
                             ))
  )) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
ggplot(df_items, aes(x=condition, y=item_level)) +
  geom_bar( stat = "summary", fun.y = "mean", fill='coral') +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2)) +
  labs(x='', y='highest level per task') +
  theme(text = element_text(size=20))


# Back and forth
concat_str <- function(vec) {
  s = ''
  for (v in vec) s = paste0(s, v)
  return(s)
}
compute_bnf <- function(pid, tid) {
  dt = df.tw %>% filter(id==pid & task==tid)
  actions = concat_str(dt$action)
  if (str_count(actions,'EF') == 0) {
    switch_d = str_count(actions,'F')
  } else {
    switch_d = -1
  }
  return(switch_d)
}
compute_bnf(2, 1)

df_switch = read.csv(text='id,task,switch_day')
for (i in df.sw$id) {
  for (t in 1:7) {
    d = compute_bnf(i, t)
    df_switch = rbind(df_switch, data.frame(id=i, task=t, switch_day=d))
  }
}
# add condition
conds_info = df.sw %>% select(id, condition)
df_switch %>%
  left_join(conds_info, by='id') %>%
  filter(switch_day > -1) %>%
  ggplot(aes(x=switch_day))+
  geom_bar() +
  facet_wrap(~condition)

# Prep per task info data and save
df.iw = df_switch %>%
  left_join(conds_info, by='id') %>%
  left_join(df_score, by=c('id', 'task', 'condition')) %>%
  left_join(df_explore, by=c('id', 'task', 'condition')) %>%
  left_join(df_items, by=c('id', 'task', 'condition'))
df.iw = df.iw %>%
  select(condition, id, task, switch_day, score, explore_rate, item_level)

save(df.sw, df.tw, df.iw, file = '../data/main1/main1.Rdata')


# Feedback effects

# Strategy reports
strategy_export = df.sw %>% select(id, condition, strategy)
write.csv(strategy_export, file='../data/main1/main1_strategy.csv')






