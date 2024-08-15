
#### prep ####
library(tidyr)
library(dplyr)
library(stringr)
library(ggplot2)
library(MoMAColors) # https://github.com/BlakeRMills/MoMAColors
library(patchwork)

source('helpers.R')

theme_set(theme_bw())
cond_levels = c('hh', 'hl', 'lh', 'll')
cond_labels = c('high p high w', 'high p low w', 'low p high w', 'low p low w')
cond_colors = moma.colors("VanGogh", 4)

# Load data
df.sw = read.csv('../data/main1/main1_subjects.csv')
df.tw = read.csv('../data/main1/main1_trials.csv')


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


#### exploration rates ####

# Per person per task
df_explore = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n()) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
plt_rate = ggplot(df_explore, aes(x=condition, y=explore_rate, fill=condition)) +
  geom_violin(alpha=0.5) +
  geom_boxplot(width=0.2) +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2), alpha=0.2) +
  stat_summary(fun = "mean", geom = "point", color = "yellow", size=5) +
  scale_fill_manual(values=cond_colors) +
  labs(x='', y='Prop. fusion attempts') +
  theme(legend.position = 'none',  legend.text = element_text(margin = margin(t = 12)),
        text = element_text(size=20))

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


# Task scores
df_score = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(score=max(total_score))

pstat_score = df_score %>%
  group_by(condition) %>%
  summarise(se=sd(score)/sqrt(n()), score=mean(score)) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))

# Add theoretical optimal
dat = try_combos(params_2)
optmal = data.frame(
  condition=c('ll', 'lh', 'hl', 'hh'),
  optimal=dat$v
) %>%
  group_by(condition) %>%
  summarise(optimal=max(optimal)) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))
plt_score=ggplot(pstat_score, aes(x=condition, y=score)) +
  geom_bar(stat = "identity", aes(fill=condition)) +
  geom_errorbar(aes(ymin=score-se, ymax=score+se), width=.2) +
  labs(x='', y='Score per round') +
  scale_fill_manual(values=cond_colors) +
  geom_point(data=optmal, aes(x=condition, y=optimal), size=5, shape=8) +
  #geom_jitter(data=df_score)
  theme(text = element_text(size=20), legend.position = 'none')




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


# Export plots

((plt_rate / plt_level) | plt_step | plt_swith ) +  plot_annotation(tag_levels = 'a')

plt_rate / plt_level + plot_annotation(tag_levels = 'a')
ggsave("plots/result-task.pdf", dpi=600, width = 8, height = 8)

plt_step / plt_swith + plot_annotation(tag_levels = 'a')
ggsave("plots/result-switch.pdf", dpi=600, width = 8, height = 12)


plt_score
ggsave("plots/result-score.pdf", dpi=600, width = 8, height = 5)


##### theoretical analysis ##### 

get_switch_day <- function(params, data, N=10) {
  switch_days = read.csv(text='p,w,day')
  
  for (i in 1:length(params)) {
    p = params[[i]]['p'][[1]]
    w = params[[i]]['w'][[1]]
    d = N-ceiling(1+1/(p*(w-1)))+1
    switch_days = rbind(switch_days, data.frame(p=p,w=w,day=d))
  }
  
  switch_days = switch_days %>%
    left_join(data, by=c('p', 'w', 'day')) %>%
    mutate(param=paste0('p=',p,', w=',w))
  
  return (switch_days)
}



plot_attempt = function(params, N=10, colors=cond_colors, lpos='bottom') {
  dat = try_combos(params)
  switch_days = get_switch_day(params, dat)
  
  
  plt = dat %>% 
    mutate(param=paste0('p=',p,', w=',w)) %>%
    ggplot(aes(x=day, y=v, color=param)) +
    geom_line(size=0.8) +
    geom_point(data=switch_days, aes(x=day, y=v), size=3) +
    theme_bw() +
    scale_x_continuous(breaks = seq(0,N)) +
    #scale_color_manual(values = wes_palette("Moonrise1", n = 4)) +
    scale_color_manual(values=colors) +
    labs(y='Expected value', x='Switch day') +
    theme(panel.grid.minor=element_blank(),
          legend.title=element_blank(),
          legend.position = lpos
    )
  
  return(plt)
}

scaled = plot_attempt(params_2)
ps = plot_attempt(list(
  list(p=0.2, w=1.5, r=1),
  list(p=0.2, w=3, r=1)
), 10, cond_colors[1:2], 'none')

ws = plot_attempt(list(
  list(p=0.2, w=3, r=1),
  list(p=0.8, w=3, r=1)
), 10, c(cond_colors[2],cond_colors[4]), 'none')

(((ps | ws)/scaled) & theme(text = element_text(size=16))) + 
  plot_annotation(tag_levels = 'a')
ggsave("plots/sims.pdf", dpi=600, width = 8, height = 8)



# Plot for talk sides - fusion rate changes over time
fusion_learning = df.tw %>%
  mutate(is_fusion=action=='F') %>%
  group_by(id, task, condition) %>%
  summarise(fusion_rate = sum(is_fusion)/n())

fusion_learning_stats = fusion_learning %>%
  group_by(task, condition) %>%
  summarise(se=sd(fusion_rate)/sqrt(n()), fusion_rate=mean(fusion_rate)) %>%
  mutate(condition=factor(condition, levels=cond_levels, labels=cond_labels))

ggplot(fusion_learning_stats, aes(x=task, y=fusion_rate, color=condition)) +
  geom_line() +
  geom_ribbon(aes(ymin=fusion_rate-se, ymax=fusion_rate+se, fill=condition), alpha=0.3, color = NA) +
  scale_fill_manual(values=cond_colors) +
  scale_color_manual(values=cond_colors) +
  scale_x_continuous(breaks = seq(7)) +
  labs(y='Fusion rate') +
  theme(text = element_text(size = 20),
        legend.position = 'bottom')








