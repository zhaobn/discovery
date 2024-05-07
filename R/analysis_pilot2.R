
library(tidyr)
library(dplyr)
library(ggplot2)
library(see)
library(ggpubr)
library(stringr)


#### Pilot 1 ####
load('../data/pilot-exp/pilot3.Rdata')
df.sw.1 = df.sw
df.tw.1 = df.tw

make_plot <- function(data, val_col, plt_title) {
  plt <- ggplot(data, aes(x = condition, y = !!sym(val_col), fill = condition)) +
    geom_violinhalf(position = position_dodge(width = 0.75), alpha = 0.5) +
    stat_summary(fun = "mean",
                 geom = "crossbar", 
                 width = 0.5,
                 colour = "red") +
    geom_jitter(position = position_jitter(width = 0.1), size = 1, alpha = 0.7) +
    geom_boxplot(width = 0.2, position = position_nudge(x=-0.15)) +
    #geom_point(data = mean_data, aes(y = value), color = 'black', shape = 95, size = 10) +
    theme_minimal() +
    labs(y = "", x = "", title = plt_title)
  return(plt)
}


# total score
make_plot(df.sw.1, 'total_score', 'Pilot 1: Total score')

# rate of exploration
explore.1 = df.tw.1 %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)
make_plot(explore.1, 'fusion_rate', 'Pilot 1: Fusion rate')


# choose the right one
df.tw.extended.1 = df.tw.1 %>%
  mutate(
    knowledge = str_split(condition, "-") %>% sapply(`[`, 1),
    high_feat = str_split(condition, "-") %>% sapply(`[`, 2),
    action_type = case_when(
      str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "cross",
      str_detect(item_selection, "circle") & !str_detect(item_selection, "square") ~ "circle",
      !str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "square",
      TRUE ~ "other"
    )
  ) 
df.expert.1 = df.tw.extended.1 %>%
  filter(action=='F') %>%
  select(id, condition, knowledge, high_feat, action_type) %>%
  mutate(match=high_feat==action_type) %>%
  group_by(id, condition) %>%
  summarise(match = sum(match), n=n()) %>%
  group_by(id, condition) %>%
  summarise(match_rate=match/n)

make_plot(df.expert.1, 'match_rate', 'Pilot 1: Match rate')


# over time
df.match.1 = df.tw.extended.1 %>%
  filter(action=='F') %>%
  select(id, task_id, step_id, condition, knowledge, high_feat, action, action_type) %>%
  mutate(
    match=as.numeric(high_feat==action_type)) %>%
  group_by(condition, step_id) %>%
  summarise(match = sum(match), n=n()) %>%
  mutate(match_rate=match/n)
ggplot(df.match.1, aes(x=step_id, y=match_rate, color=condition)) +
  geom_line() +
  theme_bw()
  



#### Pilot 2 ####
load('../data/pilot-exp/pilot2.Rdata')
df.sw.2 = df.sw
df.tw.2 = df.tw

make_plot(df.sw.2, 'total_score', 'Pilot 2: Total score')

explore.2 = df.tw.2 %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)
make_plot(explore.2, 'fusion_rate', 'Pilot 2: Fusion rate')

# choose the right one
df.tw.extended.2 = df.tw.2 %>%
  mutate(
    action_type = case_when(
      str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "cross",
      str_detect(item_selection, "circle") & !str_detect(item_selection, "square") ~ "circle",
      !str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "square",
      TRUE ~ "other"
    )) %>%
  mutate(match=ifelse(
    ((pcircle==0.8 & action_type=='circle') |
       (psquare==0.8 & action_type=='square') |
       (pcross==0.8 & action_type=='cross')), 1, 0))

df.expert.2 = df.tw.extended.2 %>%
  filter(action=='F') %>%
  group_by(id, condition) %>%
  summarise(match = sum(match), n=n()) %>%
  group_by(id, condition) %>%
  summarise(match_rate=match/n)
make_plot(df.expert.2, 'match_rate', 'Pilot 2: Match rate')

# over time
df.match.2 = df.tw.extended.2 %>%
  filter(action=='F') %>%
  group_by(condition, step_id) %>%
  summarise(match = sum(match), n=n()) %>%
  mutate(match_rate=match/n)
ggplot(df.match.2, aes(x=step_id, y=match_rate, color=condition)) +
  geom_line() +
  theme_bw()

# fusion rate over time
df.fusion.2 = df.tw.2 %>%
  group_by(condition, step_id) %>%
  summarise(fusion_rate=sum(action=='F')/n())
ggplot(df.fusion.2, aes(x=step_id, y=fusion_rate, color=condition)) +
  geom_line() +
  theme_bw()





#### Pilot 3 ####
load('../data/pilot-exp/pilot3.Rdata')
df.sw.3 = df.sw
df.tw.3 = df.tw

make_plot(df.sw.3, 'total_score', 'Pilot 3: Total score')

explore.3 = df.tw.3 %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)
make_plot(explore.3, 'fusion_rate', 'Pilot 3: Fusion rate')

# choose the right one
df.tw.extended.3 = df.tw.3 %>%
  mutate(
    action_type = case_when(
      str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "cross",
      str_detect(item_selection, "circle") & !str_detect(item_selection, "square") ~ "circle",
      !str_detect(item_selection, "circle") & str_detect(item_selection, "square") ~ "square",
      TRUE ~ "other"
    )) %>%
  mutate(match=ifelse(
    ((pcircle==0.8 & action_type=='circle') |
       (psquare==0.8 & action_type=='square') |
       (pcross==0.8 & action_type=='cross')), 1, 0))

df.expert.3 = df.tw.extended.3 %>%
  filter(action=='F') %>%
  group_by(id, condition) %>%
  summarise(match = sum(match), n=n()) %>%
  group_by(id, condition) %>%
  summarise(match_rate=match/n)
make_plot(df.expert.3, 'match_rate', 'Pilot 3: Match rate')

# over time
df.match.3 = df.tw.extended.3 %>%
  filter(action=='F') %>%
  group_by(condition, step_id) %>%
  summarise(match = sum(match), n=n()) %>%
  mutate(match_rate=match/n)
ggplot(df.match.3, aes(x=step_id, y=match_rate, color=condition)) +
  geom_line() +
  theme_bw()

# fusion rate over time
df.fusion.3 = df.tw.3 %>%
  group_by(condition, step_id) %>%
  summarise(fusion_rate=sum(action=='F')/n())
ggplot(df.fusion.3, aes(x=step_id, y=fusion_rate, color=condition)) +
  geom_line() +
  theme_bw()


# task time
make_plot(df.sw.3, 'task_duration', 'Pilot 3: Task duration (ms)')



