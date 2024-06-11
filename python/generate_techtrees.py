# %%
import itertools
import random
random.seed(2024)

import networkx as nx
import matplotlib.pyplot as plt

from plot_techtree import plot_tech_tree

# %%
def generate_tech_tree(n_base_items, n_level, sparsity, type='random'):

  # Initialization
  recipes = []
  item_levels = {}
  for i in range(n_base_items):
    item_name = f'm{i+1}'
    item_levels[item_name] = 0

  # Generate tech tree
  for k in range(1,n_level+1):

    if type == 'random':
      source_items = item_levels.keys()
      source_combos = list(itertools.combinations(source_items, 2))

    if type == 'level':
      source_items = [key for key, val in item_levels.items() if val == k-1]
      source_combos = list(itertools.combinations(source_items, 2))

    if type == 'baseinc':
      base_items = [key for key, val in item_levels.items() if val == 0]
      source_items = [key for key, val in item_levels.items() if val == k-1]
      source_combos =list(itertools.product(source_items, base_items))

    # grow tree with respect to sparsity
    sampled_combos = random.sample(source_combos, round(len(source_combos)*sparsity))

    # create recipes
    n_new_items = len(sampled_combos)
    last_index = len(item_levels.keys())
    for i in range(n_new_items):
      item_name = f'm{i+1+last_index}'

      item_recipe = {
        'source1': sampled_combos[i][0],
        'source2': sampled_combos[i][1],
        'result': item_name
      }
      recipes.append(item_recipe)

      item_level = 1+max(item_levels[item_recipe['source1']], item_levels[item_recipe['source2']])
      item_levels[item_name] = item_level

  return(recipes, item_levels)

# %%
nbase = 5
nlevel = 5
sparsity = 0.2
type = 'baseinc'
(recipes, item_levels) = generate_tech_tree(nbase, nlevel, sparsity, type)
plot_tech_tree(recipes, item_levels, type)

# %%
