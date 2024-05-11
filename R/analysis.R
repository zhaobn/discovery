
library(tidyr)
library(dplyr)
library(rstatix)
library(stringr)
library(ggplot2)
library(MoMAColors)
library(patchwork)
load('../data/main1/main1.Rdata')

theme_set(theme_bw())
cond_levels = c('hh', 'hl', 'lh', 'll')
cond_labels = c('high p high w', 'high p low w', 'low p high w', 'low p low w')
#cond_labels_long = c('high prob, high reward', 'high prob, low reward', 'low prob, high reward', 'low prob, low reward')
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


cohens_d<-function(x,y) {
  d = abs(mean(x)-mean(y))
  d1 = d/sd(x)
  d2 = d/sd(y)
  return (max(d1, d2))
}


# Per person per task
df_explore = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels)) %>%
  ungroup()
plt_rate = ggplot(df_explore, aes(x=condition, y=explore_rate, fill=condition)) +
  geom_violin(alpha=0.5) +
  geom_boxplot(width=0.2) +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2), alpha=0.2) +
  stat_summary(fun = "mean", geom = "point", color = "yellow", size=5) +
  scale_fill_manual(values=cond_colors) +
  labs(x='', y='Prop. fusion attempts') +
  theme(legend.position = 'none',  legend.text = element_text(margin = margin(t = 12)),
        text = element_text(size=20))


df_explore %>%
  filter(condition=='ll' & task %in% c(1, 7)) %>%
  group_by(task) %>%
  summarise(se=sd(explore_rate), explore_rate=mean(explore_rate)) %>%
  ungroup()


df_explore_fs = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(p=substr(condition,1,1),w=substr(condition, 2, 2))

aov(explore_rate~p+w, data=df_explore_fs) %>% summary()

pl=df_explore_fs %>% filter(p=='l') %>% pull(explore_rate)
ph=df_explore_fs %>% filter(p=='h') %>% pull(explore_rate)
cohens_d(pl,ph)

wl=df_explore_fs %>% filter(w=='l') %>% pull(explore_rate)
wh=df_explore_fs %>% filter(w=='h') %>% pull(explore_rate)
cohens_d(wh, wl)

aov(explore_rate~p+w+p:w, data=df_explore_fs) %>% summary()

lh=df_explore_fs %>% filter(p=='l' & w == 'h') %>% pull(explore_rate)
hl=df_explore_fs %>% filter(p=='h' & w == 'l') %>% pull(explore_rate)
t.test(lh, hl)
cohens_d(lh, hl)


# repeated-measure anova
df_explore = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(p=substr(condition,1,1),w=substr(condition, 2, 2)) %>%
  ungroup()
res.aov <- anova_test(
  data = df_explore, dv = explore_rate, wid = id,
  between = c(p, w),
  within = task,
)
get_anova_table(res.aov)


# repeated measure for the symmetric conditions
df_explore_sym = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(p=substr(condition,1,1),w=substr(condition, 2, 2)) %>%
  filter(condition %in% c('lh', 'hl')) %>%
  ungroup()
res.aov <- anova_test(
  data = df_explore_sym, dv = explore_rate, wid = id,
  between = condition,
  within = task,
)
get_anova_table(res.aov)



# Per step per condition
df_step = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, step, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
pstat_step = df_step %>%
  group_by(step, condition) %>%
  summarise(se=sd(explore_rate)/sqrt(n()), explore_rate=mean(explore_rate))
plt_step = ggplot(pstat_step, aes(x=step, y=explore_rate, group=condition)) +
  geom_line(aes(color=condition)) +
  geom_ribbon(aes(y = explore_rate, ymin = explore_rate-se, ymax = explore_rate + se, fill=condition), alpha = .2) +
  scale_x_continuous(breaks = seq(0,10)) +
  scale_color_manual(values=cond_colors) +
  scale_fill_manual(values=cond_colors) +
  labs(x='', y='Prop. fusion attempts') +
  theme(legend.position = c(0.15, 0.25),  
        legend.text = element_text(margin = margin(t = 12)),
        text = element_text(size=20))
# ggplot(df_step, aes(x = step, y = explore_rate, group=id)) +
#   geom_line(alpha = .5, aes(color=id)) +
#   geom_line(data = pstat_step, aes(x=step, y=explore_rate, group=1), alpha = .8, size = 2) +
#   facet_wrap(~condition) +
#   theme(strip.background =element_rect(fill="white"))



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
plt_score=ggplot(pstat_score, aes(x=condition, y=score)) +
  geom_bar(stat = "identity", aes(fill=condition)) +
  geom_errorbar(aes(ymin=score-se, ymax=score+se), width=.2) +
  labs(x='', y='Score per round') +
  scale_fill_manual(values=cond_colors) +
  geom_point(data=optmal, aes(x=condition, y=optimal), size=5, shape=8) +
  #geom_jitter(data=df_score)
  theme(text = element_text(size=20), legend.position = 'none')




# Add theoretical optimal
optmal = data.frame(
  condition=c('ll', 'lh', 'hl', 'hh'),
  optimal=dat$v
) %>%
  group_by(condition) %>%
  summarise(optimal=max(optimal)) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))




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
plt_level = ggplot(df_items, aes(x=condition, y=item_level, fill=condition)) +
  geom_bar( stat = "summary", fun.y = "mean") +
  scale_fill_manual(values=cond_colors) +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2)) +
  labs(x='', y='Highest level per round') +
  theme(text = element_text(size=20), legend.position = 'none')


df_item_fs = df.tw %>%
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
  mutate(p=substr(condition,1,1),w=substr(condition, 2, 2))

aov(item_level~p+w, data=df_item_fs) %>% summary()

pl=df_item_fs %>% filter(p=='l') %>% pull(item_level)
ph=df_item_fs %>% filter(p=='h') %>% pull(item_level)
cohens_d(pl,ph)

wl=df_item_fs %>% filter(w=='l') %>% pull(item_level)
wh=df_item_fs %>% filter(w=='h') %>% pull(item_level)
cohens_d(wh, wl)

aov(item_level~p+w+p:w, data=df_item_fs) %>% summary()



df_item_r = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(score=max(immediate_score)) %>%
  mutate(item_level = ifelse(score < 1, 0,
                             round(case_when(
                               condition=='hl'~ log(score/150, 1.5),
                               condition=='hh'~ log(score, 3),
                               condition=='lh'~ log(score/150, 3),
                               condition=='ll'~ log(score/500, 1.5),
                             )))) %>%
  mutate(p=substr(condition,1,1),w=substr(condition, 2, 2)) %>%
  ungroup()
  
res.aov <- anova_test(
  data = df_item_r, dv = item_level, wid = id,
  between = c(p, w),
  within = task,
)
get_anova_table(res.aov)


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
#compute_bnf(2, 1)

df_switch = read.csv(text='id,task,switch_day')
for (i in df.sw$id) {
  for (t in 1:7) {
    d = compute_bnf(i, t)
    df_switch = rbind(df_switch, data.frame(id=i, task=t, switch_day=d))
  }
}
# add condition
conds_info = df.sw %>% select(id, condition)
plt_swith = df_switch %>%
  left_join(conds_info, by='id') %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels)) %>%
  filter(switch_day > -1) %>%
  ggplot(aes(x=switch_day, fill=condition))+
  geom_bar() +
  labs(x='Switch step', y='Number of rounds') +
  scale_x_continuous( breaks = seq(0,10))+
  scale_fill_manual(values=cond_colors) +
  facet_wrap(~condition) +
  theme(text = element_text(size=20), legend.position = 'none')



df_switch_fs = df_switch %>%
  left_join(conds_info, by='id') %>%
  mutate(p=substr(condition, 1, 1), w=substr(condition, 2, 2))

df_switch_fs %>%
  mutate(is_bnf = switch_day==-1) %>%
  group_by(condition) %>%
  summarise(is_bnf=sum(is_bnf), n=n()) %>%
  mutate(perc=100-round(100*is_bnf/n, 2))

df_switch_fs %>%
  filter(condition=='ll' & switch_day > -1) %>%
  #summarise(n())
  group_by(switch_day) %>%
  summarise(n())


# Test switch once versus chance
totals = df_switch_fs %>%
  count(condition) %>%
  mutate(chance=ceiling(10/(2^10) * n)) %>%
  select(condition, chance)

switch_counts = df_switch_fs %>%
  mutate(is_once=switch_day>-1) %>%
  count(condition, is_once) %>%
  left_join(totals, by='condition') %>%
  ungroup()

chisq.test(switch_counts[switch_counts$condition=='hh','n'],p=c(1-0.01, 0.01), simulate.p.value = 1)
chisq.test(switch_counts[switch_counts$condition=='hl','n'],p=c(1-0.01, 0.01), simulate.p.value = 1)
chisq.test(switch_counts[switch_counts$condition=='lh','n'],p=c(1-0.01, 0.01), simulate.p.value = 1)
chisq.test(switch_counts[switch_counts$condition=='ll','n'],p=c(1-0.01, 0.01), simulate.p.value = 1)

switch_counts %>% 
  group_by(condition) %>%
  summarise(n=sum(n))

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

((plt_rate / plt_level) | plt_step | plt_swith ) +  plot_annotation(tag_levels = 'a')

plt_rate / plt_level + plot_annotation(tag_levels = 'a')
ggsave("plots/result-task.pdf", dpi=600, width = 8, height = 8)

plt_step / plt_swith + plot_annotation(tag_levels = 'a')
ggsave("plots/result-switch.pdf", dpi=600, width = 8, height = 12)


plt_score
ggsave("plots/result-score.pdf", dpi=600, width = 8, height = 5)

# Learning effect?







