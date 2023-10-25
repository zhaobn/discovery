
library(ggplot2)
library(tidyr)
library(dplyr)

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

get_exp <- function(w, p, n, N, r=1) {
  return(geom_sum(w, p, n)*(N-n)*r)
}

get_exp(2, 0.2, 0, 10)


N=10
days = seq(0,N)
pl=get_exp(2, 0.2, days, N, 50)
ph=get_exp(2, 0.8, days, N, 5)
dat=data.frame(day=days, p2=pl, p8=ph) %>%
  pivot_longer(starts_with('p'), names_to='p') %>%
  mutate(p=paste0('0.',substr(p,2,2)))
ggplot(dat, aes(x=day, y=value, color=p)) +
  geom_line() +
  theme_bw() +
  scale_x_continuous(breaks = days) +
  labs(y='expected value', x='switch day')





