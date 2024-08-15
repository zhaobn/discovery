# %%
import math
import random
import string
import itertools

import numpy as np
import pandas as pd

from joblib import Parallel, delayed

import matplotlib.pyplot as plt
import seaborn as sns



# %%
D = 10
W = 1.5
R = 100
Ks = list(range(1,11)) # beta prior
NumItems = [2, 3, 4, 5]

# %%
def beta_mean(alpha, beta):
    return alpha / (alpha + beta)

def expected_return(w, p, n, N, r=R):
  total_sum = 0
  for i in range(n + 1):
    total_sum += math.comb(n, i) * (w * p)**i * (1 - p)**(n - i)
  return total_sum * (N - n) * r

def switch_point(w, p, N):
  d_star = math.floor(1/(p*(w-1))+1)
  if d_star < N:
     return N-d_star
  else:
     return 0

def choose_largest(my_list, mode='top'):
	max_value = max(my_list)
	max_indices = [i for i, v in enumerate(my_list) if v == max_value]
	extract_index = len(my_list) - 1
	if extract_index in max_indices:
		return extract_index
	else:
		if mode == 'top':
			return random.choice(max_indices)
		elif mode == 'sample':
			probs = np.array(my_list) / np.sum(my_list)
			return np.random.choice(len(my_list), p=probs)
		else:
			raise NameError("Invalid mode")

def get_switching_point(my_list, marker):
  s_point = -1
  for i in range(len(my_list)):
    if my_list[i:] == [marker] * len(my_list[i:]):
      s_point = i
      break
  return s_point

def read_ith_entry(d, i):
	key_val = list(d.keys())[i]
	val_val = list(d.values())[i]
	return {key_val: val_val}

# %%
def novice_agent(prior, n_item, mode='top', logging=False, w=W):

  items = list(string.ascii_lowercase[:n_item])
  combos = [ x[0]+'-'+x[1] for x in list(itertools.combinations_with_replacement(items, 2)) ]
  cprobs = [0.2] * len(combos)
  cprobs[0] = 0.8

  probs = dict(zip(combos, cprobs))

  p_arms = list(probs.values())


  highest_rewards = [R] * len(items)
  belief = [(prior, prior)] * len(p_arms)

  total_reward = 0
  actions = []

  # for each step
  for d in range(D):

    # consider each choices
    returns = []
    for i in range(len(p_arms)):
      prob = beta_mean(belief[i][0], belief[i][1])
      d_star = switch_point(w, prob, D-d)

      # get corresponding item base reward
      this_combo = list(probs.keys())[i]
      item_1 = this_combo.split('-')[0]
      item_2 = this_combo.split('-')[1]
      base_r = max([highest_rewards[items.index(item_1)],
                    highest_rewards[items.index(item_2)]])
      exp_reward = expected_return(W, prob, d_star, D-d, base_r)
      returns.append(exp_reward)

    # now add the exploit action
    extract_reward = max(highest_rewards)
    total_extract_rewards = extract_reward*(D-d)
    returns.append(total_extract_rewards)

    # make a choice
    arm_chosen = choose_largest(returns, mode)
    actions.append(arm_chosen)

    if logging: print(returns)
    if logging: print(arm_chosen)

    # get observations from environment
    if arm_chosen >= len(p_arms):  # this is exploit
      total_reward += extract_reward

    else:
      if logging: print(list(probs.keys())[arm_chosen])
      total_reward += 0
      x =  random.random()
      if x < p_arms[arm_chosen]:
        if logging: print(x, p_arms[arm_chosen], 'success')
        belief[arm_chosen] = (belief[arm_chosen][0]+1, belief[arm_chosen][1])

        # increase highest reward of the corresponding category
        items_combo = list(probs.keys())[arm_chosen]
        [chosen_item_1, chosen_item_2] = items_combo.split('-')
        if chosen_item_1 == chosen_item_2:
          item_index = items.index(chosen_item_1)
          highest_rewards[item_index] = round(highest_rewards[item_index]*w)
        else:
          item_1_idx = items.index(chosen_item_1)
          item_2_idx = items.index(chosen_item_2)
          if highest_rewards[item_1_idx] > highest_rewards[item_2_idx]:
            highest_rewards[item_1_idx] = round(highest_rewards[item_1_idx]*w)
          elif highest_rewards[item_2_idx] > highest_rewards[item_1_idx]:
            highest_rewards[item_2_idx] = round(highest_rewards[item_2_idx]*w)
          else:
            if random.random() < 0.5:
              highest_rewards[item_1_idx] = round(highest_rewards[item_1_idx]*w)
            else:
              highest_rewards[item_2_idx] = round(highest_rewards[item_2_idx]*w)

      else:
        if logging: print('nothing happens')
        belief[arm_chosen] = (belief[arm_chosen][0], belief[arm_chosen][1]+1)
      if logging: print(belief)

  # check switch point
  s_point = get_switching_point(actions, len(p_arms))
  post_belief = [x for sublist in belief for x in sublist]
  post_prob = [beta_mean(x[0], x[1]) for x in belief]

  # return([prior, s_point, total_reward]+post_prob+post_belief)
  return([prior, s_point, total_reward])

# novice_agent(2, 4, 'top')

# %%
def try_w(k, n_item, n_sim=100):
  dat = []
  for _ in range(n_sim):
    sim_result = novice_agent(k, n_item, 'top')
    dat.append(sim_result)

  swith_points = [result[1] for result in dat]
  mean_switch_point = sum(swith_points)/len(swith_points)
  sd_switch_point = np.std(swith_points, ddof=1)

  total_rewards = [result[2] for result in dat]
  mean_total_rewards = sum(total_rewards)/len(total_rewards)
  sd_total_rewards = np.std(total_rewards, ddof=1)

  expert_switch_point = switch_point(W, .8, D)
  expert_optimal_reward = expected_return(W, .8, expert_switch_point, D)

  return([k, n_item, expert_switch_point, mean_switch_point, sd_switch_point,
          expert_optimal_reward, mean_total_rewards, sd_total_rewards])

try_w(1, 4)

# %%
dat = []
for k in Ks:
  for n in [2,3,4,5]:
    dat.append(try_w(k, n))

columns = ['k', 'n_item', 'expert_switch_point', 'sim_switch_point', 'sim_switch_point_sd',
           'expert_optimal_reward', 'sim_total_rewards', 'sim_total_rewards_sd']
df_w = pd.DataFrame(dat, columns=columns)
df_w

# %%
plt.figure(figsize=(10, 6))

n_items = df_w['n_item'].unique()
for n in n_items:
  subset = df_w[df_w['n_item'] == n]
  plt.plot(subset['k'], subset['sim_total_rewards'], marker='o', label=f'n_item={n}')

plt.xlabel('k')
plt.ylabel('sim_total_rewards')
plt.title('Simulated Total Rewards by k and n_item')
plt.legend(title='n_item')
plt.grid(True)

# %%
n_items = df_w['n_item'].unique()
for n in n_items:
  subset = df_w[df_w['n_item'] == n]
  plt.plot(subset['k'], subset['sim_switch_point'], marker='o', label=f'n_item={n}')

plt.xlabel('k')
plt.ylabel('sim_switch_point')
plt.title('Simulated Switch Points by k and n_item')
plt.legend(title='n_item')
plt.grid(True)

# TODO: add error bar, rename legend and title, run with larger n_sims

# %%
