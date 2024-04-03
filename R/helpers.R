

cohens_d<-function(x,y) {
  d = abs(mean(x)-mean(y))
  d1 = d/sd(x)
  d2 = d/sd(y)
  return (max(d1, d2))
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


params_1 = list(
  list(p=0.2, w=2, r=1),
  list(p=0.8, w=2, r=1),
  list(p=0.2, w=3, r=1),
  list(p=0.8, w=3, r=1)
)
params_2 = list(
  list(p=0.2, w=1.5, r=500),
  list(p=0.8, w=1.5, r=150),
  list(p=0.2, w=3, r=150),
  list(p=0.8, w=3, r=1)
)

