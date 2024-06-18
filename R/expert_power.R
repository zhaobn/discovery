
library(dplyr)

# Load data
load('../data/pilot-exp/pilotSplit.Rdata')

sw.to_use = df.sw %>% 
  filter(condition %in% c('expert-high', 'novice-high'))
sw_ids = sw.to_use %>% pull(id)

tw.to_use = df.tw %>%
  filter(id %in% sw_ids)

tw.measures = tw.to_use %>%
  filter(task_type=='task') %>%
  mutate(is_fusion=action=='F') %>%
  group_by(id, condition, task_id) %>%
  summarise(fusion_rate=sum(is_fusion)/n())


# Get summary statistics
tw.measures %>% 
  group_by(condition) %>% 
  summarise(n=n(),
            mean_fusion_rate=sum(fusion_rate)/n(),
            sd=sd(fusion_rate))
n1 <- 90
n2 <- 70
mean1 <- 0.496
mean2 <- 0.404
sd1 <- 0.226
sd2 <- 0.246

# Calculate pooled standard deviation
pooled_sd <- sqrt(((n1 - 1) * sd1^2 + (n2 - 1) * sd2^2) / (n1 + n2 - 2))

# Calculate Cohen's d
cohen_d <- (mean1 - mean2) / pooled_sd
cohen_d








