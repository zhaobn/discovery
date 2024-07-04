
library(tidyr)
library(dplyr)
library(rstatix)
library(ggplot2)
library(see)
library(ggpubr)
library(stringr)


load('../data/main2/main2.Rdata')

#### Helper functions ####
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
###########################

#### Fusion rate ####
explore_data = df.tw %>%
  filter(task_type=='task') %>%
  group_by(id, condition) %>%
  summarise(n_fusion=sum(action=='F'), n=n()) %>%
  mutate(fusion_rate=n_fusion/n)

make_plot(explore_data, 'fusion_rate', 'Fusion rate')

explore_data %>% 
  group_by(condition) %>%
  summarise(fusion_rate_mean=mean(fusion_rate))


# Stats
explore_data_task = df.tw %>%
  mutate(explore=as.numeric(action=='F')) %>%
  group_by(id, task_id, condition) %>%
  summarise(fusion_rate=sum(explore)/n()) %>%
  ungroup()
res.aov <- anova_test(
  data = explore_data_task, dv = fusion_rate, wid = id,
  between = condition,
  within = task_id,
)
get_anova_table(res.aov)


