
library(rjson)
library(dplyr)
options(scipen=999)


dat = read.csv('./data/pilot/crystalPilot2.csv')

start_index = 2
end_index = nrow(dat)


# Helper function - un-jsonify data
inv_fromJSON<-function(js) {
  js <- chartr("\\","\"",js)
  fromJSON(js)
}



# Collect subject data
sw<-sapply(sapply(dat$subject, inv_fromJSON, simplify=F), as.data.frame, simplify=F)
df.sw.aux<-sw[[start_index]]
for (i in (start_index+1):end_index) {
  df.sw.aux<-rbind(df.sw.aux, sw[[i]])
}
# Add trial info
trial_info = dat %>%
  select(prolific_id=worker, assignment)
df.sw = df.sw.aux %>%
  left_join(trial_info, by='prolific_id') %>%
  select(prolific_id, date, time, assignment, age, sex, total_score, task_duration, engagement, difficulty, strategy, feedback, token, start_time)

# Save raw subject data
write.csv(df.sw, file='data/pilot/pilot2_sw.csv')




# Collect trial data
d = inv_fromJSON(dat$trial[start_index])[[1]]
d[['prolific_id']] = dat$worker[start_index]
df.tw.aux = data.frame(d)

for (i in start_index:end_index) {
  x = inv_fromJSON(dat$trial[i])
  worker_id = dat$worker[i]
  
  for (j in 1:length(x)) {
    
    if (i != start_index | j != 1){
      d = x[[j]]
      d[['prolific_id']] = worker_id
      df.tw.aux = rbind(df.tw.aux, data.frame(d))
      
    }
    
  }
}
# Save raw trial data
write.csv(df.tw.aux, file='data/pilot/pilot2_tw.csv')


# Use id to replace prolific_id
ids = dat %>%
  select(id, prolific_id=worker) %>%
  filter(id>=start_index)

sw_names = colnames(df.sw)
sw_names[1] <- 'id'
df.sw = df.sw %>%
  left_join(ids, by='prolific_id') %>%
  select(sw_names)

tw_names = colnames(df.tw.aux)
df.tw = df.tw.aux %>%
  left_join(ids, by='prolific_id') %>%
  select(id, tw_names[1:length(tw_names)-1])


# Add condition
condition_info = df.sw %>% select(id, condition=assignment)
df.tw = df.tw %>% left_join(condition_info, by='id')

# Remove practice trials
df.tw = df.tw %>% 
  filter(substr(task_id, 1, 1)!='p') %>%
  mutate(task_id=as.numeric(substr(task_id, 2, nchar(task_id))))


# Compute time collapsed
start_times = df.sw %>% select(id, start_time)
df.tw = df.tw %>% 
  left_join(start_times, by='id') %>%
  mutate(task_sec=(timestamp-start_time)/1000)

df.tw = df.tw %>%
  mutate(known=as.numeric(substr(condition, 1, 1)=='k')) %>%
  select(id, task=task_id, step=step_id, condition, known, p, item_selection, action, feedback, immediate_score, total_score, task_sec)

# Save data
df.sw = df.sw %>%
  mutate(age=as.numeric(age), total_score=as.numeric(total_score), task_duration=as.numeric(task_duration), engagement=as.numeric(engagement), difficulty=as.numeric(difficulty))
save(df.tw, df.sw, file='data/pilot/pilot2.Rdata')





