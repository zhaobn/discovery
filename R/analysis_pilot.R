
library(tidyr)
library(dplyr)
library(ggplot2)
library(ggpubr)
load('../data/main1/main1.Rdata')

df.sw %>% count(sex)

#### Power analysis ####
df.tw %>%
  mutate(explore=action=='F') %>%
  group_by(condition) %>%
  summarise(explore_rate=sum(explore)/70, n=n()/(10*7))

test_data = df.tw %>% mutate(explore=action=='F')
d_hh = test_data %>% filter(condition=='bhh') %>% pull(explore)
d_hl = test_data %>% filter(condition=='bhl') %>% pull(explore)
d_lh = test_data %>% filter(condition=='blh') %>% pull(explore)
d_ll = test_data %>% filter(condition=='bll') %>% pull(explore)

cohens_d <- function (x, y) {
  mean_diff = mean(x) - mean(y)
  svar1 = var(x)*length(x)
  svar2 = var(y)*length(y)
  sd_pooled = (svar1+svar2)/(length(x)+length(y)-2)
  return( sqrt(mean_diff/sd_pooled) ) 
}

cohens_d(d_hh, d_hl)
cohens_d(d_lh, d_ll)
cohens_d(d_hh, d_lh)
cohens_d(d_hl, d_ll)

cohens_d(d_lh, d_hl)




# ANOVA
test_data = df.tw %>% 
  mutate(explore=action=='F', pc=substr(condition, 2,2), wc=substr(condition, 3, 3)) %>%
  select(id, task, step, condition, pc, wc, explore)

test_data_grouped = test_data %>%
  group_by(id, task, condition, pc, wc) %>%
  summarise(explore=sum(explore)/n())

ggboxplot(test_data_grouped, x = "wc", y = "explore", color='pc')

m=aov(explore ~ pc * wc, data = test_data_grouped)
summary(m)

m1 = test_data_grouped %>% filter(condition=='bhh') %>% pull(explore) %>% mean()
m2 = test_data_grouped %>% filter(condition=='bhl') %>% pull(explore) %>% mean()
m3 = test_data_grouped %>% filter(condition=='blh') %>% pull(explore) %>% mean()
m4 = test_data_grouped %>% filter(condition=='bll') %>% pull(explore) %>% mean()
sqrt(-((m1-m2)-(m3-m4))/sd(test_data_grouped$explore))




#### Label confusion #### 
lbd = df.tw %>%
  filter(action=='F') %>%
  select(id, task, step, item_selection, action, feedback, immediate_score, condition, total_score, task_sec)

# Keep fusing the same
unique_fusion = lbd %>%
  group_by(id, task, condition) %>%
  count(item_selection) %>%
  mutate(is_unique=n==1) %>%
  group_by(id, task, condition) %>%
  summarise(is_unique=sum(is_unique)/sum(n)) %>%
  group_by(condition) %>%
  summarise(is_unique=sum(is_unique)/n()) %>%
  mutate(unique_total_fusion=round(is_unique*100,1)) %>%
  select(condition, unique_total_fusion)

# Same first fuse selection
unique_first_fusion_attemp = lbd %>%
  group_by(id, task, condition) %>%
  mutate(first_step = min(step)) %>%
  filter(step==first_step) %>%
  group_by(id, condition) %>%
  count(item_selection) %>%
  mutate(is_unique=n==1) %>%
  group_by(condition) %>%
  summarise(is_unique=sum(is_unique)/n()) %>%
  mutate(unique_first_fusion=round(is_unique*100,1)) %>%
  select(condition, unique_first_fusion)
  
  
# First fuse repeats previous successes
successes = lbd %>% 
  filter(feedback==1, task<6) %>%
  select(id, task_joiner=task, step, prev_item_selection=item_selection)
first_selections = lbd %>%
  group_by(id, task, condition) %>%
  mutate(first_step = min(step)) %>%
  filter(step==first_step, task > 1) %>%
  mutate(task_joiner=task-1) %>%
  select(id, task, task_joiner, condition, item_selection) 
first_repeat = first_selections %>%
  full_join(successes, by=c('id', 'task_joiner')) %>%
  filter(!is.na(prev_item_selection)) %>%
  group_by(condition) %>%
  summarise(is_repeat=sum(item_selection==prev_item_selection),
            is_repeat_perc=sum(item_selection==prev_item_selection)/(5*10)) %>%
  mutate(first_fusion_repeat=round(is_repeat_perc*100,1)) %>%
  select(condition, first_fusion_repeat)


# Put together
label_stats = unique_fusion %>%
  left_join(unique_first_fusion_attemp, by='condition') %>%
  left_join(first_repeat, by='condition')
write.csv(label_stats, file='label_stats.csv')


# [ab]-[cd] vs. [ab]-c
nested_combos_base = lbd %>% filter(nchar(item_selection)== 6)
nested_combos_comp = lbd %>% 
  filter(nchar(item_selection)== 9) %>%
  filter(substr(item_selection,2,2) %in% c('a','b','c','d','e','f'))
nested_combos_base_count = nested_combos_base %>%
  group_by(id, condition) %>%
  summarise(combo_base=n())
nested_combos_comp_count = nested_combos_comp %>%
  group_by(id, condition) %>%
  summarise(combo_comp=n())
nested_combos_base_count %>%
  full_join(nested_combos_comp_count, by=c('id', 'condition')) %>%
  mutate(combo_base=ifelse(is.na(combo_base), 0, combo_base),
         combo_comp=ifelse(is.na(combo_comp), 0, combo_comp)) %>%
  mutate(total=combo_base+combo_comp) %>%
  group_by(condition, id) %>%
  summarise(sum(combo_comp), sum(combo_comp)/sum(total))


#### Demographics #### 

mean(df.sw$age)
sd(df.sw$age)

df.sw %>%
  mutate(is_female=sex=='female') %>%
  summarise(is_female=sum(is_female), perc=sum(is_female)/n())

df.sw %>%
  mutate(task_time=task_duration/60000) %>%
  summarise(mean(task_time), sd(task_time))



#### Per condition #### 
df.sw %>% count(assignment)
df.tw = df.tw %>% mutate(condition=substr(condition, 2, 3))

# Total score
scores = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(total_score=max(total_score)) %>%
  group_by(condition) %>%
  summarise(score=mean(total_score), se=sd(total_score)/sqrt(n()))
ggplot(scores, aes(x=condition, y=score)) +
  geom_bar(stat='identity', fill='cornflowerblue') +
  geom_errorbar(aes(ymin=score-se, ymax=score+se), width=.2) +
  theme_bw()
  

# Extraction rates
exploration = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task, condition) %>%
  summarise(explore_rate=sum(explore)/n(), exploration_count=sum(explore)) %>%
  mutate(p=substr(condition,2,2), w=substr(condition,3,3), condition=substr(condition, 2, 3))

ggplot(exploration, aes(x=condition, y=explore_rate, fill=condition)) +
  geom_violin(alpha=0.5) +
  geom_boxplot(width=0.2) +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2)) +
  stat_summary(fun = "mean", geom = "point", color = "yellow", size=3) +
  theme_bw() +
  theme(legend.position = 'right')


# Quick check significance
aov(exploration_count~p+w+p*w, data=exploration) %>% summary()

cohens_d<-function(x,y) {
  d = abs(mean(x)-mean(y))
  d1 = d/sd(x)
  d2 = d/sd(y)
  return (max(d1, d2))
}

pl=exploration %>% filter(p=='l') %>% pull(explore_rate)
ph=exploration %>% filter(p=='h') %>% pull(explore_rate)

cohens_d(pl,ph)

cohens_d(ph, pl)

wl=exploration %>% filter(w=='l') %>% pull(explore_rate)
wh=exploration %>% filter(w=='h') %>% pull(explore_rate)

cohens_d(wh, wl)

bhl = exploration %>% filter(condition=='hl') %>% pull(explore_rate)
blh = exploration %>% filter(condition=='lh') %>% pull(explore_rate)

t.test(bhl, blh, paired = FALSE)
cohens_d(bhl, blh)




t.test(
  exploration %>% filter(condition=='hh') %>% pull(exploration_count),
  exploration %>% filter(condition=='hl') %>% pull(exploration_count),
)
t.test(
  exploration %>% filter(condition=='lh') %>% pull(exploration_count),
  exploration %>% filter(condition=='ll') %>% pull(exploration_count),
)
t.test(
  exploration %>% filter(condition=='hl') %>% pull(exploration_count),
  exploration %>% filter(condition=='lh') %>% pull(exploration_count),
)



# Rank by score
ranking = df.tw %>%
  group_by(id, condition) %>%
  summarise(total_score=max(total_score)) %>%
  arrange(-total_score)
ranking$score_rank=seq(nrow(ranking))

# Plot raw data
dd = df.tw %>%
  select(id, task, step, condition, action) %>%
  mutate(action=as.numeric(action=='F')) %>%
  left_join(ranking, by=c('id', 'condition')) %>%
  select(id=score_rank, task, step, condition, action) %>%
  mutate(id=as.factor(id))

ggplot(dd, aes(x=step, y=task, fill=action)) +
  geom_tile() +
  facet_wrap(condition~id) +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(6))+
  theme(panel.background = element_blank())


# Plot average per task
dd_avg = df.tw %>%
  select(id, task, step, condition, action) %>%
  mutate(action=as.numeric(action=='F')) %>%
  group_by(task, step, condition) %>%
  summarise(action=mean(action))
ggplot(dd_avg, aes(x=step, y=task, fill=action)) +
  geom_tile() +
  facet_wrap(~condition, nrow = 2) +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(6))+
  theme(panel.background = element_blank())



# Plot average per condition
exp_avg = df.tw %>%
  mutate(action=as.numeric(action=='F')) %>%
  group_by(condition, step) %>%
  summarise(exploration_rate=sum(action)/n(), se=sd(action)/sqrt(n()))
ggplot(exp_avg, aes(x=step, y=exploration_rate, group=condition)) +
  geom_line(aes(color=condition)) +
  geom_ribbon(aes(y = exploration_rate, ymin = exploration_rate-se, ymax = exploration_rate + se, fill=condition), alpha = .2) +
  theme_bw()


# Most rewarding item
items = df.tw %>%
  group_by(id, task, condition) %>%
  summarise(score=max(immediate_score)) %>%
  mutate(item_level = ifelse(score < 1, 0,
    round(case_when(
      condition=='hl'~ log(score/150, 1.5),
      condition=='hh'~ log(score, 3),
      condition=='lh'~ log(score/150, 3),
      condition=='ll'~ log(score/500, 1.5),
    ))
  ))

ggplot(items, aes(x=condition, y=item_level)) +
  geom_bar( stat = "summary", fun.y = "mean") +
  geom_jitter(position = position_jitter(seed = 1, width = 0.2)) +
  theme_bw()



# Overview - completion time, total score, engagement, difficulty
df.sw %>%
  mutate(task_time=task_duration/60000) %>%
  group_by(assignment) %>%
  summarise(mean(task_time), sd(task_time),
            mean(total_score), sd(total_score),
            mean(engagement),
            mean(difficulty),
            n=n())



#### Completion time #### 
df.sw %>% pull(task_duration) %>% mean()/60000


#### Total score #### 
x = df.tw %>%
  group_by(id, task_id) %>%
  summarise(total_score=max(total_score)) %>%
  group_by(id) %>%
  summarise(total_score=sum(total_score)) %>%
  arrange(desc(total_score))
x['fid'] = seq(nrow(x))

df.tw %>%
  filter(p!=0.4) %>%
  mutate(p=as.character(p)) %>%
  group_by(id, task_id, p) %>%
  summarise(total_score=max(total_score)) %>%
  group_by(id, p) %>%
  summarise(total_score=sum(total_score)) %>%
  ggplot(aes(x=reorder(id, desc(total_score)), y=total_score, fill=p)) +
  geom_bar(stat='identity') +
  scale_fill_brewer(palette="Greys") +
  theme_bw() 


#### Plot performance per p ####

# Clean data
dd = df.tw %>%
  select(id, task, p, step, action, total_score) %>%
  arrange(id, p, task, step)

# total score per condition
dd %>%
  group_by(id, task, p) %>%
  summarise(total_score = max(total_score)) %>%
  group_by(p) %>%
  summarise(total_score = sum(total_score)) %>%
  ggplot(aes(x=p, y=total_score)) +
  geom_bar(stat = 'identity') +
  geom_text(aes(label = total_score), vjust = 1.5, colour = "white") +
  theme_bw()



# percentage of fusion per condition
dd %>%
  group_by(id, task, p) %>%
  summarise(extract_perc=sum(action)/n()) %>%
  ggplot(aes(x=as.character(p), y=extract_perc)) +
  geom_boxplot()




# most rewarding items per condition
dd_fusion = df.tw %>%
  filter(substr(task_id,1,1)=='t') %>%     # remove practice trials
  mutate(task=as.numeric(substr(task_id,2,nchar(task_id))),
         action=as.numeric(action=='E')) %>%
  select(id, task, p, step=step_id, action, immediate_score) %>%
  arrange(id, p, task, step)
dd_fusion['task'] = rep(rep(1:12,each=10), 10)

dd_fusion %>%
  group_by(id, task, p) %>%
  summarise(immediate_score = max(immediate_score)) %>%
  mutate(p=as.character(p)) %>%
  ggplot(aes(x=p, y=immediate_score)) +
  geom_bar(stat = "summary", fun.y = "mean")




#### Plot raw action data ####

# Order by total score
dd=dd %>%
  left_join(select(x, id, fid), by='id')

# Plot all raw data
plot_ind_actions = dd %>%
  ggplot(aes(x=step, y=task, fill=action)) +
  geom_tile() +
  facet_grid(~id) +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(12))+
  theme(panel.background = element_blank()) +
  geom_hline(aes(yintercept=4.5),color='red') +
  geom_hline(aes(yintercept=8.5),color='red')
plot_ind_actions

plot_ind_scores = dd %>%
  ggplot(aes(x=step, y=task, fill=log(total_score))) +
  geom_tile() +
  facet_grid(~fid)
plot_ind_scores

# Plot averages
plot_avg_actions = dd %>%
  group_by(task, step) %>%
  summarise(action=mean(action)) %>%
  ggplot(aes(x=step, y=task, fill=action)) +
  geom_tile() +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(12))+
  theme(panel.background = element_blank()) +
  geom_hline(aes(yintercept=4.5),color='red') +
  geom_hline(aes(yintercept=8.5),color='red') +
  geom_text(aes(0,4.5,label='p=0.2', vjust = 1.5)) +
  geom_text(aes(0,8.5,label='p=0.4', vjust = 1.5)) +
  geom_text(aes(0,12.5,label='p=0.8', vjust = 1.5))
plot_avg_actions

plot_avg_scores = dd %>%
  group_by(task, step) %>%
  summarise(total_score=mean(total_score)) %>%
  ggplot(aes(x=step, y=task, fill=log(total_score))) +
  geom_tile() +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(12))+
  theme(panel.background = element_blank()) +
  geom_hline(aes(yintercept=4.5),color='red') +
  geom_hline(aes(yintercept=8.5),color='red') +
  geom_text(aes(0,4.5,label='p=0.2', vjust = 1.5)) +
  geom_text(aes(0,8.5,label='p=0.4', vjust = 1.5)) +
  geom_text(aes(0,12.5,label='p=0.8', vjust = 1.5))
plot_avg_scores






df.tw %>%
  filter(condition=='hh') %>%
  ggplot(aes(x=step, y=task, fill=action)) +
  geom_tile() +
  facet_grid(~id) +
  scale_x_continuous(breaks=seq(10))+
  scale_y_continuous(breaks=seq(12))+
  theme(panel.background = element_blank())






