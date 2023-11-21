
library(ggplot2)
library(tidyr)
library(dplyr)
library(wesanderson)
library(patchwork)

# get_sum <- function(w, p, n) {
#   sum = 0
#   for (i in 0:n) {
#     sum = sum + (w*p)^i*(1-p)^(n-i)
#   }
#   return(sum)
# }
# geom_sum <- function(w, p, n) {
#   gr = p*w/(1-p)
#   return( (1-gr^(n+1))/(1-gr) * (1-p)^n )
# }
full_sum <- function(w, p, n) {
  sum = 0
  for (i in 0:n) {
    sum = sum + choose(n,i)*(w*p)^i*(1-p)^(n-i)
  }
  return(sum)
}


get_exp <- function(w, p, n, N, r=1) {
  return(full_sum(w, p, n)*(N-n)*r)
}

get_exp(3, 0.2, 2, 10)



#### Try combinations ####
try_combos = function(params, N=10) {
  days = seq(0,N)
  
  ret_dat = read.csv(text='days,p,w,v')
  for (i in 1:length(params)) {
    
    vl = rep(0,N+1)
    p = params[[i]]['p'][[1]]
    w = params[[i]]['w'][[1]]
    r = params[[i]]['r'][[1]]
    for (d in days) {
      vl[d+1] = get_exp(w, p, d, N, r)
    }
    ret_dat = rbind(ret_dat, data.frame(day=days,p=p,w=w,v=vl))
  }
  
  ret_dat = ret_dat %>% mutate(param=paste0('p=',p,', w=',w))
  return(ret_dat)
}

# Add switch days
get_switch_day <- function(params, data, N=10) {
  switch_days = read.csv(text='p,w,day')
  
  for (i in 1:length(params)) {
    p = params[[i]]['p'][[1]]
    w = params[[i]]['w'][[1]]
    d = N-ceiling(1+1/(p*(w-1)))+1
    switch_days = rbind(switch_days, data.frame(p=p,w=w,day=d))
  }
  
  switch_days = switch_days %>%
    left_join(data, by=c('p', 'w', 'day')) %>%
    mutate(param=paste0('p=',p,', w=',w))
  
  return (switch_days)
}


# Plot
plot_attempt = function(params, N=10) {
  dat = try_combos(params)
  switch_days = get_switch_day(params, dat)
  
  plt = dat %>% 
    mutate(param=paste0('p=',p,', w=',w)) %>%
    ggplot(aes(x=day, y=v, color=param)) +
    geom_line(size=0.8) +
    geom_point(data=switch_days, aes(x=day, y=v), size=3) +
    theme_bw() +
    scale_x_continuous(breaks = days) +
    scale_color_manual(values = wes_palette("Moonrise1", n = 4)) +
    labs(y='expected value', x='switch day') +
    theme(panel.grid.minor=element_blank(),
          legend.title=element_blank(),
          legend.position = 'right')
  
  return(plt)
}


# Adjust base pay
params_1 = list(
  list(p=0.2, w=2, r=500),
  list(p=0.8, w=2, r=30),
  list(p=0.2, w=3, r=200),
  list(p=0.8, w=3, r=1)
)
dat = try_combos(params)
dat %>%
  group_by(p, w) %>%
  slice(which.max(v))

p1a = plot_attempt(list(
  list(p=0.2, w=2, r=1),
  list(p=0.8, w=2, r=1),
  list(p=0.2, w=3, r=1),
  list(p=0.8, w=3, r=1)
))
p1b = plot_attempt(list(
  list(p=0.2, w=2, r=500),
  list(p=0.8, w=2, r=30),
  list(p=0.2, w=3, r=200),
  list(p=0.8, w=3, r=1)
))
p2a = plot_attempt(list(
  list(p=0.2, w=2, r=1),
  list(p=0.8, w=1.2, r=1),
  list(p=0.2, w=4, r=1),
  list(p=0.8, w=2, r=1)
))
p2b = plot_attempt(list(
  list(p=0.2, w=2, r=20),
  list(p=0.8, w=1.2, r=20),
  list(p=0.2, w=4, r=3),
  list(p=0.8, w=2, r=1)
))


((( p1a | p2a ) / ( p1b | p2b )) & theme(legend.position = "bottom")) + plot_layout(guides = "collect") + plot_annotation(tag_levels = 'a')



((p_raw / p_adjust) & theme(legend.position = "bottom")) + plot_layout(guides = "collect") + plot_annotation(tag_levels = 'a')



