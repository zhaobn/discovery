# %%
import networkx as nx
import matplotlib.pyplot as plt

# %%
# # Define the list of recipes
# recipes = [
#   {'source1': 'item1', 'source2': 'item2', 'result': 'item5'},
#   {'source1': 'item3', 'source2': 'item4', 'result': 'item6'},
#   {'source1': 'item5', 'source2': 'item6', 'result': 'item7'}
# ]

# # Define the levels of each item
# item_levels = {
#   'item1': 0, 'item2': 0, 'item3': 0, 'item4': 0,
#   'item5': 1, 'item6': 1, 'item7': 2
# }

# %%
# Create a directed graph
def plot_tech_tree(recipes, item_levels, type, fig_x=10, fig_y=8, level_offset=2, horizontal_spacing=2):
  """
  Plots a tech tree based on the provided recipes and item levels.

  Parameters:
      recipes (list of dict): List of dictionaries where each dictionary represents a recipe with 'source1', 'source2', and 'result'.
      item_levels (dict): Dictionary where keys are item names and values are their levels.
      level_offset (int): Vertical space between levels. Default is 2.
      horizontal_spacing (int): Horizontal space between nodes at the same level. Default is 2.
  """
  G = nx.DiGraph()

  # Add edges based on recipes
  for recipe in recipes:
    G.add_edge(recipe['source1'], recipe['result'])
    if recipe.get('source2'):
      G.add_edge(recipe['source2'], recipe['result'])

  # Ensure all nodes are added to the graph
  for node in item_levels.keys():
    if node not in G.nodes:
      G.add_node(node)

  # Define the positions of each node
  pos = {}

  # Calculate the positions for each level
  level_nodes = {}
  for node, level in item_levels.items():
    if level not in level_nodes:
        level_nodes[level] = []
    level_nodes[level].append(node)

  for level, nodes in level_nodes.items():
    for i, node in enumerate(nodes):
        pos[node] = (i * horizontal_spacing, -level * level_offset)

  # Draw the graph
  plt.figure(figsize=(fig_x, fig_y))
  nx.draw(G, pos, with_labels=True, node_size=3000, node_color='skyblue', font_size=10, font_weight='bold', arrows=True)
  plt.title(f'Tech Tree ({type})')
  plt.axis('off')
  plt.margins(0.1)
  plt.tight_layout()
  plt.show()

# # %% Nice plot
# # Create a directed graph
# G = nx.DiGraph()

# # Add edges based on recipes
# for recipe in recipes:
#   G.add_edge(recipe['source1'], recipe['result'])
#   G.add_edge(recipe['source2'], recipe['result'])

# # Define the positions of each node
# pos = {}
# level_offset = 0.5  # vertical space between levels
# horizontal_spacing = 0.5  # horizontal space between nodes at the same level

# # Calculate the positions for each level
# level_nodes = {}
# for node, level in item_levels.items():
#   if level not in level_nodes:
#     level_nodes[level] = []
#   level_nodes[level].append(node)

# # Positioning nodes at level 0
# x = 0
# for node in level_nodes[0]:
#   pos[node] = (x, -item_levels[node] * level_offset)
#   x += horizontal_spacing

# # Positioning nodes at higher levels:
# for level in level_nodes.keys():
#   for node in level_nodes[level]:
#     source1, source2 = None, None
#     for recipe in recipes:
#       if recipe['result'] == node:
#         source1, source2 = recipe['source1'], recipe['source2']
#         break
#     if source1 and source2:
#       x1, y1 = pos[source1]
#       x2, y2 = pos[source2]
#       pos[node] = ((x1 + x2) / 2, -item_levels[node] * level_offset)

# # Draw the graph edges
# plt.figure(figsize=(10, 8))
# ax = plt.gca()
# for recipe in recipes:
#   x1, y1 = pos[recipe['source1']]
#   x2, y2 = pos[recipe['source2']]
#   xr, yr = pos[recipe['result']]

#   # Shifted horizontal line between parents
#   shifted_y = y1 - 0.1

#   # Draw horizontal line between parents
#   ax.plot([x1, x2], [shifted_y, shifted_y], 'k-', lw=2)

#   # Draw vertical lines from parents to the shifted horizontal line
#   ax.plot([x1, x1], [y1, shifted_y], 'k-', lw=2)
#   ax.plot([x2, x2], [y2, shifted_y], 'k-', lw=2)

#   # Draw vertical line to the offspring
#   mid_x = (x1 + x2) / 2
#   ax.plot([mid_x, mid_x], [shifted_y, yr], 'k-', lw=2)

# # Draw the graph nodes on top of edges
# nx.draw_networkx_nodes(G, pos, node_size=3000, node_color='skyblue')
# nx.draw_networkx_labels(G, pos, font_size=10, font_weight='bold')

# plt.title('Family Tree')
# plt.axis('off')
# plt.margins(0.1)
# plt.tight_layout()
