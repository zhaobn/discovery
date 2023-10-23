
library(tidyr)
library(dplyr)
library(ggplot2)
load('data/pilot/pulled.Rdata')


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
  filter(substr(task_id,1,1)=='t') %>%     # remove practice trials
  mutate(task=as.numeric(substr(task_id,2,nchar(task_id))),
         action=as.numeric(action=='E')) %>%
  select(id, task, p, step=step_id, action, total_score) %>%
  arrange(id, p, task, step)
dd['task'] = rep(rep(1:12,each=10), 10)    # re-order trials

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
  facet_grid(~fid) +
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













