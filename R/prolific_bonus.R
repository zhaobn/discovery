
library(tidyr)
library(dplyr)

all_prolific = read.csv('../data/pilot-exp/prolific_export_denPilot.csv')
all_subj = read.csv('../data/pilot-exp/crystalEpDenPilot.csv')
cleaned_subj = read.csv('../data/pilot-exp/pilotDen_subjects.csv')


# Get bonus for missing ids
all_ids = all_prolific %>%
  filter(Status == 'APPROVED') %>%
  select(Participant.id, Started.at, Completed.at)
colnames(all_ids) = c('prolific_id', 'start_time', 'completion_time') 

attempt_1 = all_ids %>% arrange(completion_time)
attempt_1['id'] = seq(nrow(all_ids))

patch_1 = attempt_1 %>% 
  filter(id < 9) %>%
  select(prolific_id, id)
patch_3 = attempt_1 %>%
  filter(id > 17) %>%
  select(prolific_id, id) %>%
  mutate(id=id-2)
patch_2 = attempt_1 %>%
  filter(id >= 9 & id <= 17) %>%
  select(prolific_id)

# do stuff in clean_data.R
all_bonuses = df.sw.aux %>%
  select(prolific_id, total_score) %>%
  mutate(bonus = round(as.numeric(total_score/20000), 2))
all_bonuses['id'] = seq(nrow(all_bonuses))


patch_1_bonus = all_bonuses %>%
  filter(id < 9) %>%
  select(id, bonus)
patch_1_bonus = patch_1_bonus %>%
  left_join(patch_1, by='id')
patch_1_bonus = patch_1_bonus %>%
  select(prolific_id, bonus)

patch_3_bonus = all_bonuses %>%
  filter(id > 15) %>%
  select(prolific_id, bonus)

missing_bonus = all_bonuses %>%
  filter(id >=9 & id <=15) 
missing_bonus_val = max(missing_bonus$bonus)
patch_2_bonus = patch_2 %>%
  mutate(bonus = missing_bonus_val)

final = rbind(patch_1_bonus, patch_2_bonus, patch_3_bonus)
write.csv(final, file='../data/pilot-exp/denPilot_bonus.csv', row.names = FALSE)
