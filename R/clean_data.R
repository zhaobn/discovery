
library(rjson)
library(dplyr)

dat = read.csv('./data/crystal.csv')

start_index = 1
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
  select(prolific_id, date, time, assignment, age, sex, task_duration, engagement, difficulty, strategy, feedback, token)

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








