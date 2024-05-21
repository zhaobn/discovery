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
D = 12
W = 1.5
R = 10

# %%
def prep_data(n_item):
  items = list(string.ascii_lowercase[:n_item])
  combos = [ x[0]+'-'+x[1] for x in list(itertools.combinations_with_replacement(items, 2)) ]

  probs = [0.2] * len(combos)
  probs[0] = 0.8
  # probs[-1] = 0.4

  return(dict(zip(combos, probs)))

# probs = prep_data(4)
# probs

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
  probs = prep_data(n_item)
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

novice_agent(2, 4, 'top')

# %%
# Play with parameter values
def try_w(w, arms):
  dat = []
  for _ in range(1000):
    for k in Ks:
      sim_result = novice_agent(k, w, arms)
      dat.append(sim_result)

  swith_points = [result[1] for result in dat]
  mean_switch_point = sum(swith_points)/len(swith_points)

  total_rewards = [result[2] for result in dat]
  mean_total_rewards = sum(total_rewards)/len(total_rewards)

  expert_p = arms[choose_largest(arms)]
  expert_switch_point = switch_point(w, expert_p, D)
  expert_optimal_reward = expected_return(w, expert_p, expert_switch_point, D)

  return([expert_p, w, expert_switch_point, mean_switch_point, expert_optimal_reward, mean_total_rewards])

try_w(1.5, [0.8, 0.2, 0.2])

# %%
dat = []
for p in [0.5, 0.6, 0.7, 0.8, 0.9]:
  p_vec = [p, 0.2, 0.2]
  for w in [1.2, 1.5, 2, 2.5, 3]:
    dat.append(try_w(w, p_vec))

columns = ['high_p', 'w', 'expert_switch_point', 'sim_switch_point', 'expert_optimal_reward', 'sim_total_rewards']
df_w = pd.DataFrame(dat, columns=columns)
df_w
df_w.to_csv("try_params.csv", index=False)

# %%

def run_simulation(k):
	return novice_agent(k, 1.5, [0.8, 0.2, 0.2], 'sample')

Ks = list(range(1,11))  # Define Ks with the appropriate values
n_jobs = 5  # Specify the number of cores to use
dat = Parallel(n_jobs=n_jobs)(delayed(run_simulation)(k) for _ in range(10000) for k in Ks)


columns = ['prior', 'switch_point', 'total_reward', 'pb_s', 'pb_c', 'pb_x', 'alpha_s', 'beta_s', 'alpha_c', 'beta_c', 'alpha_x', 'beta_x']
df = pd.DataFrame(dat, columns=columns)

# %%
grouped_df = df.groupby('prior').agg({'switch_point': ['mean', 'std'],
                                      'total_reward': ['mean', 'std'],
                                      'pb_s': ['mean', 'std'],
                                      'pb_c': ['mean', 'std'],
                                      'pb_x': ['mean', 'std']})

# Renaming the columns for clarity
grouped_df.columns = ['Switch Point (Mean)', 'Switch Point (Std.)',
                      'Total Reward (Mean)', 'Total Reward (Std.)',
                      'Prob Square (Mean)', 'Prob Square (Std.)',
                      'Prob Circle (Mean)', 'Prob Circle (Std.)',
                      'Prob Cross (Mean)', 'Probability Cross (Std.)']

# Resetting the index to make 'prior' a column again
grouped_df.reset_index(inplace=True)
grouped_df
grouped_df.to_csv("sim2_10k.csv", index=False)


# %%
grouped_df_0 = pd.read_csv('sim_10k.csv',index_col=None)

expert_switch_point = switch_point(W, 0.8, D)
expert_optimal_reward = expected_return(W, 0.8, expert_switch_point, D)

df_top = grouped_df_0[['prior', 'Switch Point (Mean)', 'Switch Point (Std.)', 'Total Reward (Mean)', 'Total Reward (Std.)']]
df_sampling = grouped_df[['prior', 'Switch Point (Mean)', 'Switch Point (Std.)', 'Total Reward (Mean)', 'Total Reward (Std.)']]


# Create subplots
fig, axs = plt.subplots(2, 1, figsize=(8, 10))

# Plot for Total Reward
axs[0].errorbar(grouped_df['prior'], grouped_df['Total Reward (Mean)'],
                yerr=grouped_df['Total Reward (Std.)'],
                fmt='o', markersize=5, capsize=5, label='Total Reward')
axs[0].axhline(y=expert_optimal_reward, color='orange', linestyle='--', label='Expert')
axs[0].set_xlabel('Prior')
axs[0].set_ylabel('Total Reward')
axs[0].set_title('Mean and Std. of Total Reward')

# Plot for Switch Point
axs[1].errorbar(grouped_df['prior'], grouped_df['Switch Point (Mean)'],
                yerr=grouped_df['Switch Point (Std.)'],
                fmt='o', markersize=5, capsize=5, label='Switch Point')
axs[1].axhline(y=expert_switch_point, color='orange', linestyle='--', label='Expert')
axs[1].set_xlabel('Prior')
axs[1].set_ylabel('Switch Point')
axs[1].set_title('Mean and Std. of Switch Point')

# Show legends for both subplots
axs[0].legend()
axs[1].legend()

# Adjust layout
plt.tight_layout()



# %%
shift = 0.2

plt.errorbar(df_top['prior'], df_top['Switch Point (Mean)'], yerr=df_top['Switch Point (Std.)'], fmt='o', label='Top Mode', color='blue')
plt.errorbar(df_sampling['prior']+shift, df_sampling['Switch Point (Mean)'], yerr=df_sampling['Switch Point (Std.)'], fmt='o', label='Sampling Mode', color='red')
plt.axhline(y=expert_switch_point, color='orange', linestyle='--', label='Expert Switch Point')

plt.xlabel('Prior')
plt.ylabel('Switch Point')
plt.title('Switch Point vs Prior')
plt.legend()

# %%
Ks = list(range(1, 11))
def try_w(n_item):
  dat = []
  for _ in range(1000):
    for k in Ks:
      sim_result = novice_agent(k, n_item, 'top')
      dat.append(sim_result)

  swith_points = [result[1] for result in dat]
  mean_switch_point = sum(swith_points)/len(swith_points)

  total_rewards = [result[2] for result in dat]
  mean_total_rewards = sum(total_rewards)/len(total_rewards)

  expert_switch_point = switch_point(W, .8, D)
  expert_optimal_reward = expected_return(W, .8, expert_switch_point, D)

  return([n_item, expert_switch_point, mean_switch_point, expert_optimal_reward, mean_total_rewards])

try_w(4)

# %%
dat = []
for n in [2,3,4,5]:
  dat.append(try_w(n))

columns = ['n_item', 'expert_switch_point', 'sim_switch_point', 'expert_optimal_reward', 'sim_total_rewards']
df_w = pd.DataFrame(dat, columns=columns)
df_w


# %%
