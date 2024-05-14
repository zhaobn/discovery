# %%
import math
import random

import numpy as np
import pandas as pd

import matplotlib.pyplot as plt
import seaborn as sns

# %%
D = 10
W = 3
R = 10
items = ['square', 'circle']
probs = {
  'square-square': 0.8,
  'circle-circle': 0.2,
  'square-circle': 0.2,
}
demo_ps = list(probs.values())


Ks = list(range(1, 11))

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

def choose_largest(my_list):
  max_value = max(my_list)
  max_indices = [i for i, v in enumerate(my_list) if v == max_value]
  extract_index = len(my_list)-1
  if extract_index in max_indices:
    return extract_index
  else:
    return random.choice(max_indices)

def get_switching_point(my_list, marker):
  s_point = -1
  for i in range(len(my_list)):
    if my_list[i:] == [marker] * len(my_list[i:]):
      s_point = i
      break
  return s_point

# %%
def novice_agent(prior, w=W, p_arms=demo_ps):
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

      if i == 0 or i == 1:
        base_r = highest_rewards[i]
      else:
        base_r = highest_rewards[choose_largest(highest_rewards)]
      exp_reward = expected_return(W, prob, d_star, D-d, base_r)
      returns.append(exp_reward)

    # now add the exploit
    extract_reward = highest_rewards[choose_largest(highest_rewards)]
    total_extract_rewards = extract_reward*(D-d)
    returns.append(total_extract_rewards)

    # make a choice
    arm_chosen = choose_largest(returns)
    actions.append(arm_chosen)

    # print(returns)
    # print(arm_chosen)

    # get observations from environment
    if arm_chosen >= len(p_arms):  # this is exploit
      total_reward += extract_reward

    else:
      total_reward += 0
      if random.random() < p_arms[arm_chosen]:
        belief[arm_chosen] = (belief[arm_chosen][0]+1, belief[arm_chosen][1])
        # increase highest reward of the corresponding category
        if arm_chosen == 0 or arm_chosen == 1:
          highest_rewards[arm_chosen] = round(highest_rewards[arm_chosen]*w)
        elif random.random() < 0.5:
          highest_rewards[0] = round(highest_rewards[0]*w)
        else:
          highest_rewards[1] = round(highest_rewards[1]*w)

      else:
        belief[arm_chosen] = (belief[arm_chosen][0], belief[arm_chosen][1]+1)


  # check switch point
  s_point = get_switching_point(actions, len(p_arms))
  post_belief = [x for sublist in belief for x in sublist]
  post_prob = [beta_mean(x[0], x[1]) for x in belief]

  return([prior, s_point, total_reward]+post_prob+post_belief)

# novice_agent(2)

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
dat = []

for _ in range(1000):
  for k in Ks:
    sim_result = novice_agent(k)
    dat.append(sim_result)

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
#grouped_df.to_csv("sim_10k.csv", index=False)


# %%
grouped_df = pd.read_csv('sim_10k.csv',index_col=None)

expert_switch_point = switch_point(W, 0.8, D)
expert_optimal_reward = expected_return(W, 0.8, expert_switch_point, D)



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
# Save
