# %%

# %%
# Output looks like
recipes = [
  {'source1': 'item1', 'source2': 'item2', 'result': 'item5'},
  {'source1': 'item3', 'source2': 'item4', 'result': 'item6'},
  {'source1': 'item5', 'source2': 'item6', 'result': 'item7'}
]

# Define the levels of each item
item_levels = {
  'item1': 0, 'item2': 0, 'item3': 0, 'item4': 0,
  'item5': 1, 'item6': 1, 'item7': 2
}

# %%
base_items = []
