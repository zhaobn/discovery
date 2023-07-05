#%%
import numpy as np
import pandas as pd
from itertools import combinations

import matplotlib.pyplot as plt

# %%
all_items = ['A1', 'B', 'C', 'D', 'G2', 'H1', 'L2', 'M1', 'O2', 'P1', 'Q2' ]
# all_items = ['A1', 'B', 'C', 'H1', 'M1', 'P1', ]

tech_tree = [
  [['A1', 'B'], 'H1'],
  [['C', 'H1'], 'M1'],
  [['B', 'M1'], 'P1'],

  [['B', 'G2'], 'L2'],
  [['C', 'L2'], 'O2'],
  [['B', 'O2'], 'Q2'],
]

rewards = {
  'P1': 100,
  'Q2': 100
}


# %%
def normalize(vec):
  return [ x / sum(vec) for x in vec]

def softmax(vec, base = 1):
  raised = [x*base for x in vec]
  return np.exp(raised) / np.sum(np.exp(raised), axis=0)

def init_lib ( items_list, bias=0 ):
  lib = []
  all_combos = list(combinations(items_list, 2))

  for combo in all_combos:
    lib.append([combo[0], combo[1], 1/len(all_combos), 1])
  lib_df = pd.DataFrame(lib, columns=['item_1', 'item_2', 'p', 'r'])
  lib_df['item_d'] = ''

  if (bias > 0):
    clan_items = list(filter(lambda x: len(x) > 1 and x[1]=='1', items_list))
    lib_df.loc[lib_df['item_1'].isin(clan_items), 'p'] = 1/len(all_combos) + bias
    lib_df.loc[lib_df['item_2'].isin(clan_items), 'p'] = 1/len(all_combos) + bias
    lib_df['p'] = normalize(lib_df['p'])

  return lib_df[['item_1', 'item_2', 'item_d', 'p', 'r']]


def make_combo(lib):
  lib['weight'] = lib.p * lib.r
  sampled = lib.sample(n=1, weights = lib['weight'])
  actions = sampled.values.tolist()[0]
  return [actions[0], actions[1]]

def generate_evidence(action, tech_tree=tech_tree, rewards=rewards):
  techs = [ ''.join(t[0]) for t in tech_tree ]
  choice = ''.join(action)
  if choice in techs:
    choice_idx = techs.index(choice)
    obs = tech_tree[choice_idx]
    discovered = obs[1]
    if discovered in list(rewards.keys()):
      gained = rewards[discovered]
    else:
      gained = 0
    return (discovered, gained)
  else:
    return (None, 0)

def update_lib(lib, action, evidence):
  if evidence[0] is None:
    lib.loc[(lib['item_1']==action[0]) & (lib['item_2']==action[1]), 'p'] = 0
    lib['p'] = normalize(lib['p'])
    return lib[['item_1', 'item_2', 'item_d', 'p', 'r']]

  else:
    (new_item, reward) = evidence
    lib.loc[(lib['item_1']==action[0]) & (lib['item_2']==action[1]), 'item_d'] = new_item
    # lib.loc[(lib['item_1']==action[0]) & (lib['item_2']==action[1]), 'p'] += 1

    if reward > 0:
      lib.loc[(lib['item_1']==action[0]) & (lib['item_2']==action[1]), 'r'] += reward
      # items to reward recursively
      rs_to_update = attribute_reward(new_item, reward, lib, [])
      for el in rs_to_update:
        lib.loc[lib['item_d']==el[0], 'r'] = el[1]

  return lib


def attribute_reward(item, reward, lib, ret):
  tech_inventory = list(filter(None, lib['item_d']))
  if item in tech_inventory:
    ret.append((item, reward))
    source_items = lib[lib['item_d']==item].values.tolist()[0][:2]
    for item in source_items:
      attribute_reward(item, reward/2, lib, ret)
  return ret


# %%
sims = []
for s in range(1):
  disc_1n = []
  disc_2n = []
  lib = init_lib(all_items, bias=0.7)
  for i in range(1000):
    action = make_combo(lib)
    obs = generate_evidence(action)
    lib = update_lib(lib, action, obs)

    discovered = list(filter(None, lib['item_d']))
    disc_1 = (list(filter(lambda x: x[1]=='1', discovered)))
    disc_1n.append(len(disc_1))
    disc_2n.append(len(discovered)-len(disc_1))

  sims.append([disc_1n, disc_2n])

plt.plot(range(1000), sims[0][0])
plt.plot(range(1000), sims[0][1])
# for s in range(10):
#   plt.plot(range(1000), sims[s])

# %%
