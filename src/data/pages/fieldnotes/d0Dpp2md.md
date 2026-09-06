---
uid: d0Dpp2md
address: "ML//RL//AlphaGo"
name: "AlphaGo"
date: "2018-06-15"
---

DeepMind's AlphaGo beat Lee Sedol in 2016 by combining Monte Carlo tree search with neural networks for move selection and position evaluation. AlphaGo Zero later removed human game data and learned through self-play.

- Search and learning divide the work: the network compresses experience into useful priors; tree search spends computation on the position currently in front of it.
- Self-play manufactures a curriculum whose difficulty rises with the agent. The opponent is always approximately as capable as the learner because it is another version of the learner.
- The deeper result was not “Go is solved.” It was that learned intuition could make combinatorial search practical in spaces where brute force was absurd.

[[NYb6zLJ5|reinforcement learning]] : : AlphaGo made policy improvement, value estimation, self-play, and planning work as one system
