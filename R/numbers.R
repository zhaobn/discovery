
library(ggplot2)
library(tidyr)
library(dplyr)
library(wesanderson)
library(patchwork)

get_sum <- function(w, p, n) {
  sum = 0
  for (i in 0:n) {
    sum = sum + (w*p)^i*(1-p)^(n-i)
  }
  return(sum)
}
geom_sum <- function(w, p, n) {
  gr = p*w/(1-p)
  return( (1-gr^(n+1))/(1-gr) * (1-p)^n )
}
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

get_exp(2, 0.2, 2, 10)


N=10
days = seq(0,N)


pl = rep(0,N+1)
ph = rep(0,N+1)
wl = rep(0,N+1)
wh = rep(0,N+1)
for (d in days) {
  pl[d+1] = get_exp(2, 0.2, d, N, 1) #20
  ph[d+1] = get_exp(2, 0.8, d, N, 1) #1
  wl[d+1] = get_exp(4, 0.2, d, N, 1) #3
  wh[d+1] = get_exp(1.2, 0.8, d, N, 1) #25
}
dat = data.frame(day=days,p=0.2,w=2,v=pl)
dat = rbind(dat, data.frame(day=days,p=0.8,w=2,v=ph))
dat = rbind(dat, data.frame(day=days,p=0.2,w=4,v=wl))
dat = rbind(dat, data.frame(day=days,p=0.8,w=1.2,v=wh))

dat %>% 
  mutate(param=paste0('p=',p,', w=',w)) %>%
  ggplot(aes(x=day, y=v, color=param)) +
  geom_line(size=0.8)+
  theme_bw() +
  scale_x_continuous(breaks = days) +
  scale_color_manual(values = wes_palette("Moonrise1", n = 4)) +
  labs(y='expected value', x='switch day') +
  theme(panel.grid.minor=element_blank())




# Add switch days
get_switch_day <- function(w, p, N) {
  return (N-ceiling(1+1/(p*(w-1)))+1)
}
get_switch_day(2, 0.2, 10)
get_switch_day(2, 0.8, 10)
get_switch_day(4, 0.2, 10)
get_switch_day(1.2, 0.8, 10)

switch_days = data.frame(p=c(0.2, 0.2, 0.8, 0.8),w=c(2,4,1.2,2),d=0)
switch_days$day=get_switch_day(switch_days$w, switch_days$p, 10)
switch_days$param = paste0('p=',switch_days$p,', w=',switch_days$w)
switch_days = switch_days %>%
  left_join(dat, by=c('day', 'p', 'w'))

p_raw = dat %>% 
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



p_adjust

((p_raw / p_adjust) & theme(legend.position = "bottom")) + plot_layout(guides = "collect") + plot_annotation(tag_levels = 'a')



