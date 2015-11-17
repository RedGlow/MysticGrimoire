# MysticGrimoire

Repository of all known Guild Wars 2's Mystic Forge recipes.

# How to use this repository

...

# How to contribute to this repository

...

# Format

The basic entity represented in this repository is a recipe.

- **family**: array of strings, indicating family of transformation, subfamily, subsubfamily, ...
- **outputs**: array of objects
	- **id**: id of the output
	- **minAmount**: minimum amount of output from this recipe
	- **maxAmount**: maximum amount of output from this recipe
	- **probability**: number in 0-1 range expressing the probability this is the result. This probability is considered equally distributed between all the amounts between *minAmount* and *maxAmount*. The sum of the probabilities of all the entries in *output_item_ids* must be 1.
- **inputs**: array of objects
	- **id**: id of the input
	- **amount**: amount

The entries automatically produced, relative to the root entry, are:

- /recipes: an array of all the recipes;
- /recipes/by_output/*id*: an array of all the recipes producing item with given *id*;
- /recipes/by_output/averaged/*id*: same as /recipes/by_output/id, but the outputs are averaged on their amounts, and just one is generated (minAmount and maxAmount are thus the same, and can be non-integer);
- /recipes/by_input/*id*: an array of all the recipes which need the item with given *id*.
- /recipes/by_type/*type*_*subtype*_*subsubtype*_...: an array of all the recipes pertaining given family, subfamily, subsubfamily... specifier. 

# Sources

- http://gw2profits.com/json/v2/forge/
- https://gist.github.com/codemasher/e2e0e5e39de5dc4439e0