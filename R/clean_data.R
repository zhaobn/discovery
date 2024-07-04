
library(rjson)
library(dplyr)
library(tidyr)
options(scipen=999)


dat = read.csv('../data/main2/crystalEpMain.csv')

start_index = 3
end_index = nrow(dat)


# Helper function - un-jsonify data
inv_fromJSON<-function(js) {
  js <- chartr("\\","\"",js)
  fromJSON(js)
}

# Fix subject data
sw=as.data.frame((inv_fromJSON(dat$subject[[start_index]])))
# for (i in (start_index+1):end_index) {
#   # x = inv_fromJSON(dat$subject[[i]])
#   # sw = rbind(sw, as.data.frame(x))
#   print(i)
#   x = inv_fromJSON(dat$subject[[i]])
# }

# Collect subject data
sw<-sapply(sapply(dat$subject, inv_fromJSON, simplify=F), as.data.frame, simplify=F)
df.sw.aux<-sw[[start_index]]
for (i in (start_index+1):end_index) {
  df.sw.aux<-rbind(df.sw.aux, sw[[i]])
}

# # Fix values
# df.sw.aux = df.sw.aux %>%
#   mutate(age=if_else(prolific_id=='60fd4f8bcf203e8452b79f1a', '22', age)) %>%
#   mutate(prolific_id=if_else(nchar(prolific_id)<1, '598afb77600a7a00018fabd7', prolific_id))

# get bonus
bonus_dat = df.sw.aux %>% select(prolific_id, total_score) %>%
  mutate(bonus=round(total_score/20000*100)/100)
write.csv(bonus_dat, file='../data/main2/bonus.csv')


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


# Use id to replace prolific_id for final data
ids = dat %>%
  select(id, prolific_id=worker) %>%
  filter(id>=start_index)

sw_names = c('id', 'condition', 'age', 'sex', 'total_score', 'engagement', 'difficulty', 'strategy', 'impression', 'feedback', 'date', 'time', 'task_duration', 'intruction', 'start_time')
df.sw = df.sw.aux %>%
  left_join(ids, by='prolific_id') %>%
  select(all_of(sw_names))



# Manul ID
df.sw.aux['id'] = seq(nrow(df.sw.aux))
block_size = nrow(df.tw.aux)/nrow(df.sw.aux)
df.tw.aux['id'] = rep(1:nrow(df.sw.aux), each = block_size)


# Add condition
condition_info = df.sw.aux %>% select(id, condition)
# tw_names = c('id', 'condition', 'task_id', 'step_id', 'action', 'item_selection', 'feedback', 'immediate_score', 'total_score', 'timestamp')
tw_names_2 = c('id', 'condition', 'task_id', 'knowledge', 'density', 'highCombo', 'step_id', 'action', 'item_selection', 'feedback', 'immediate_score', 'total_score', 'timestamp')
df.tw = df.tw.aux %>%
  left_join(condition_info, by='id') %>%
  select(all_of(tw_names_2))

# # Pull together task info
# df.info = df.tw.aux %>%
#   select(prolific_id, knowledge, squareOnLeft, pcircle, psquare, pcross, w) %>%
#   unique() %>%
#   left_join(ids, by='prolific_id') %>%
#   select(id, knowledge, squareOnLeft, pcircle, psquare, pcross, w)


# # clean up for expert test pilot 1
# sw.info = df.sw %>% select(id, condition) %>%
#   split_and_expand('condition', '-') %>%
#   select(id, knowledge=condition_1, high_feat=condition_2)
# df.sw = df.sw %>%
#   left_join(sw.info, by='id') %>%
#   select('id', 'condition', 'knowledge', 'high_feat', 'age', 'sex', 'total_score', 'engagement', 'difficulty', 'strategy', 'feedback', 'date', 'time', 'task_duration', 'intruction', 'start_time')
# 

# # Remove practice trials
# df.tw = df.tw %>% 
#   filter(substr(task_id, 1, 1)!='p') %>%
#   mutate(task_id=as.numeric(substr(task_id, 2, nchar(task_id))))

# Compute time collapsed
start_times = df.sw %>% select(id, start_time)
df.tw = df.tw %>% 
  left_join(start_times, by='id') %>%
  mutate(task_sec=(timestamp-start_time)/1000)
df.tw = df.tw %>%
  mutate(task_type=ifelse(substr(task_id,1,1)=='t', 'task', 'practice'),
         task_id=as.numeric(substr(task_id, 2, nchar(task_id)))) %>%
  select("id","condition","task_type","task_id","knowledge","density","highCombo","step_id","action","item_selection" ,"feedback","immediate_score","total_score","timestamp","start_time","task_sec")

# df.tw = df.tw %>%
#   mutate(known=as.numeric(substr(condition, 1, 1)=='k')) %>%
#   select(id, task=task_id, step=step_id, condition, known, p, item_selection, action, feedback, immediate_score, total_score, task_sec)

# Save data
df.sw = df.sw %>%
  mutate(age=as.numeric(age), total_score=as.numeric(total_score), task_duration=as.numeric(task_duration), engagement=as.numeric(engagement), difficulty=as.numeric(difficulty))
# fix NA
# df.sw.backup = df.sw
# df.sw = df.sw %>% mutate(engagement=ifelse(is.na(engagement),5,engagement))
save(df.tw, df.sw, file='../data/main2/main2.Rdata')
write.csv(df.sw, file='../data/main2/main2_subjects.csv')
write.csv(df.tw, file='../data/main2/main2_trials.csv')

# # Fix missing prolific id
# ids = df.sw.aux %>% 
#   filter(nchar(prolific_id)>1) %>%
#   mutate(is_data=1) %>%
#   select(prolific_id, is_data)
# all_demographics = read.csv('../data/main1/prolific_export.csv')
# all_ids = all_demographics %>%
#   filter(Status=='APPROVED') %>%
#   mutate(is_demo=1) %>%
#   select(prolific_id=Participant.id, is)
# check_ids = all_ids %>%
#   left_join(ids, by='prolific_id')
# 
# # '598afb77600a7a00018fabd7' is good!
# # '6045ac8a103c4c14db5e6d24' no data, miss-approved



# sanity check with help of chatgpt
# Function to split text_column by delimiter and return as separate columns
split_and_expand <- function(data, column, delimiter) {
  # Splitting the text column
  split_text <- strsplit(data[[column]], split = delimiter)
  
  # Determining the maximum number of splits
  max_splits <- max(lengths(split_text))
  
  # Creating new column names
  new_columns <- paste0(column, "_", 1:max_splits)
  
  # Creating new columns
  new_data <- cbind(data, do.call(rbind, lapply(split_text, function(x) {
    length(x) <- max_splits
    return(x)
  })))
  colnames(new_data)[(ncol(data) + 1):ncol(new_data)] <- new_columns
  
  return(new_data)
}


# santity check
sw.info = df.sw %>% select(id, condition) %>%
  split_and_expand('condition', '-') %>%
  select(id, s_knowledge=condition_1, high_feat=condition_2)
df.info %>% left_join(sw.info, by='id') %>%
  mutate(k_check=knowledge==s_knowledge, 
         p_check=case_when(
           high_feat=='cross' ~ pcross==0.8,
           high_feat=='square' ~ psquare==0.8,
           high_feat=='circle' ~ pcircle==0.8
         )) %>%
  filter(k_check==FALSE | p_check==FALSE)
  



