# %%
import numpy as np
np.random.seed(1702)

import pandas as pd
import itertools
import math

import matplotlib.pyplot as plt
import seaborn as sns

# %%
def find_state_index(s, S):
    return S.index(s)

def update_state_values(ndays, prob, incentive, base_reward, gamma):

  SIZES = list(range(1, ndays+1))
  DAYS_LEFT = list(range(1, ndays+1))
  STATES = list(filter(lambda x: x[0] + x[1] <= ndays + 1 , itertools.product(SIZES, DAYS_LEFT)))
  ACTIONS = ('a', 'b')

  state_values = [0] * len(STATES)
  policy_a = [0] * len(STATES)

  def get_immediate_reward(s, a):
    return round(base_reward * (incentive ** s[0])) if a == 'a' else 0

  def get_nextstate(s, a):
    if s[1] <= 1:
      return s
    else:
      days_left = max(s[1] - 1, 1)
      if (a == 'a'):
        return [[(s[0], days_left)], [1]]
      else:
        return [[(s[0], days_left), (s[0]+1, days_left)], [1-prob, prob]]


  def update_states_on_dayleft(i, gamma):

    states = filter(lambda x: x[1] == i, STATES)

    for s in states:

      if (i==1):

        state_values[find_state_index(s, STATES)]  = get_immediate_reward(s, 'a')
        policy_a[find_state_index(s, STATES)] = 1

      else:

        q_vals = []
        for a in ACTIONS:
          reward = get_immediate_reward(s, a)

          [ s_prime, s_prob ] = get_nextstate(s, a)
          s_prime_vals = [state_values[find_state_index(x, STATES)] for x in s_prime ]
          s_returns = [ gamma*x*y for x, y in zip(s_prime_vals, s_prob) ]

          q_vals.append(reward + sum(s_returns))

        # Take max action
        max_action_index = np.where(np.array(q_vals)== max(q_vals))[0].tolist()
        state_values[find_state_index(s, STATES)] = max(q_vals)
        policy_a[find_state_index(s, STATES)] = 1/len(max_action_index) if 0 in max_action_index else 0


  for d in DAYS_LEFT:
    update_states_on_dayleft(d, gamma)

  return(STATES, state_values, policy_a)


def get_policy_for_plot(states, policy_a):

  max_day = max([ d for (_, d) in states ])
  a_on_day = [0] * max_day

  for d in range(max_day):
    p_states = filter(lambda x: x[1] == max_day - d, states)
    a_probs = []

    for s in p_states:
      a_probs.append(policy_a[find_state_index(s, states)])

    a_on_day[d] = sum(a_probs)/len(a_probs)

  return(list(range(max_day)), a_on_day)


# %%
S, V, Pi = update_state_values(6, .5, 2, 1, 1)
# list(zip(S, V, Pi))
days, a_prob = get_policy_for_plot(S, Pi)
fig, ax = plt.subplots()
plt.xticks(days)
ax.plot(days, a_prob)
ax.set_xlabel('Day')
ax.set_ylabel('Prob action a')

# %%
Ndays = [5, 10, 15, 20]
Probs = [0.2, 0.5]
Incentives = [1.2] + [2**x for x in range(1, 6)]
Modes = ['max', 'prob']

trial_dat = pd.DataFrame(columns=['total_day', 'sparcity', 'incentive', 'day', 'a'])
for N in Ndays:
  for p in Probs:
    for w in Incentives:
      S, V, Pi = update_state_values(N, p, w, 10, 1)
      days, a_prob = get_policy_for_plot(S, Pi)
      day_dat = {
        'total_day': [N] * len(days),
        'sparcity': [p] * len(days),
        'incentive': [w] * len(days),
        'day': days,
        'a': a_prob,
      }
      trial_dat = pd.concat([trial_dat, pd.DataFrame(day_dat)], ignore_index=True)


# %%
sns.set_style("white")


test_dat = trial_dat.loc[(trial_dat['total_day']==20) & (trial_dat['sparcity']==0.5)]
sns.relplot(
    data=test_dat, kind="line",
    x="day", y="a",
    hue="incentive", palette='hls'
)

# %%
g = sns.FacetGrid(trial_dat, row="incentive", col='sparcity')
g.map_dataframe(sns.lineplot, x="day", y="a", hue="total_day", palette='hls')
g.add_legend()


# %%
def days_left(p, w):
  return math.floor(1 + 1/(p * (w-1)))

days_left(0.5, 2)
for i in Incentives:
  print(i, days_left(0.5, i))

# %%
