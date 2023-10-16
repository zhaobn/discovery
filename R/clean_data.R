
library(rjson)
library(dplyr)

dat = read.csv('./data/crystal.csv')

#Un-jsonify it
inv_fromJSON<-function(js) {
  js <- chartr("\\","\"",js)
  fromJSON(js)
}




start_index = 1
end_index = nrow(dat)

# and turn each subject into a dataframe
sw<-sapply(sapply(dat$subject, inv_fromJSON, simplify=F), as.data.frame, simplify=F)
df.sw.aux<-sw[[start_index]]
for (i in (start_index+1):end_index) {
  df.sw.aux<-rbind(df.sw.aux, sw[[i]])
}


x = inv_fromJSON(dat$trial[1])
test = data.frame(x[[1]])

tw<-sapply(sapply(td_batch$trialwise, inv_fromJSON, simplify=F), as.data.frame, simplify=F)
N<-length(tw)
M<-22


# Combine them
df.sw.aux<-sw[[start_index]]
df.tw.aux<-tw[[start_index]]
for (i in (start_index+1):end_index) {
  df.sw.aux<-rbind(df.sw.aux, sw[[i]])
  df.tw.aux<-rbind(df.tw.aux, tw[[i]])
}
# And append them to the id and upis
df.sw<-data.frame(ix=td_batch$id, id=td_batch$participant)
df.sw<-cbind(df.sw, df.sw.aux)

df.tw.aux = df.tw.aux %>% rename(tid=id)
df.tw<-cbind(ix=rep(df.sw$ix, each=M), id=rep(df.sw$id, each=M), prolific_id=rep(df.sw$prolific_id, each=M), df.tw.aux)

