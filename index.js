const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const USER_ID = "anshikasharma_13042005";
const EMAIL_ID = "anshika0034.be23@chitkara.edu.in";
const COLLEGE_ROLL = "2310990034";────────────────────────────────────────────────

const EDGE_REGEX = /^([A-Z])->([A-Z])$/;

function parseInput(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (let raw of data) {
    const entry = typeof raw === "string" ? raw.trim() : String(raw).trim();

    // validate format
    const match = entry.match(EDGE_REGEX);
    if (!match) {
      invalid_entries.push(entry === raw ? entry : raw); // keep original for display
      continue;
    }

    const [, parent, child] = match;

    // self-loop
    if (parent === child) {
      invalid_entries.push(entry);
      continue;
    }

    const edgeKey = `${parent}->${child}`;
    if (seenEdges.has(edgeKey)) {
      // Only push once to duplicate_edges
      if (!duplicate_edges.includes(edgeKey)) {
        duplicate_edges.push(edgeKey);
      }
    } else {
      seenEdges.add(edgeKey);
      validEdges.push({ parent, child, edgeKey });
    }
  }

  return { validEdges, invalid_entries, duplicate_edges };
}

function buildHierarchies(validEdges) {
  // Build adjacency and track child nodes
  const children = {}; // parent -> [child, ...]
  const parentOf = {}; // child -> first parent (diamond rule)
  const allNodes = new Set();

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    // diamond: if child already has a parent, discard
    if (parentOf[child] !== undefined) continue;
    parentOf[child] = parent;

    if (!children[parent]) children[parent] = [];
    children[parent].push(child);
  }

  // Find roots: nodes that never appear as a child
  const roots = [...allNodes].filter((n) => parentOf[n] === undefined);

  // Group nodes into connected components using union-find
  const uf = {};
  function find(x) {
    if (uf[x] === undefined) uf[x] = x;
    if (uf[x] !== x) uf[x] = find(uf[x]);
    return uf[x];
  }
  function union(a, b) {
    uf[find(a)] = find(b);
  }

  for (const { parent, child } of validEdges) {
    union(parent, child);
  }

  // Group all nodes by component
  const components = {};
  for (const node of allNodes) {
    const root = find(node);
    if (!components[root]) components[root] = [];
    components[root].push(node);
  }

  const hierarchies = [];

  for (const compKey of Object.keys(components)) {
    const nodes = components[compKey];

    // Find root(s) of this component
    const compRoots = nodes.filter((n) => parentOf[n] === undefined);

    // Detect cycle via DFS
    function hasCycle(startNodes) {
      const visited = new Set();
      const inStack = new Set();
      function dfs(node) {
        visited.add(node);
        inStack.add(node);
        for (const child of children[node] || []) {
          if (!visited.has(child)) {
            if (dfs(child)) return true;
          } else if (inStack.has(child)) {
            return true;
          }
        }
        inStack.delete(node);
        return false;
      }
      for (const n of startNodes) {
        if (!visited.has(n) && dfs(n)) return true;
      }
      return false;
    }

    let effectiveRoot;
    let cyclic = false;

    if (compRoots.length === 0) {
      // pure cycle — use lex smallest
      effectiveRoot = [...nodes].sort()[0];
      cyclic = true;
    } else {
      effectiveRoot = compRoots.sort()[0]; // lex smallest root
      cyclic = hasCycle(compRoots);
    }

    if (cyclic) {
      hierarchies.push({ root: effectiveRoot, tree: {}, has_cycle: true });
      continue;
    }

    // Build nested tree
    function buildTree(node) {
      const obj = {};
      for (const child of children[node] || []) {
        obj[child] = buildTree(child);
      }
      return obj;
    }

    // Depth = number of nodes on longest root-to-leaf path
    function calcDepth(node) {
      const kids = children[node] || [];
      if (kids.length === 0) return 1;
      return 1 + Math.max(...kids.map(calcDepth));
    }

    const tree = { [effectiveRoot]: buildTree(effectiveRoot) };
    const depth = calcDepth(effectiveRoot);

    hierarchies.push({ root: effectiveRoot, tree, depth });
  }

  return hierarchies;
}

function buildSummary(hierarchies) {
  const nonCyclic = hierarchies.filter((h) => !h.has_cycle);
  const cyclic = hierarchies.filter((h) => h.has_cycle);

  let largest = null;
  for (const h of nonCyclic) {
    if (
      largest === null ||
      h.depth > largest.depth ||
      (h.depth === largest.depth && h.root < largest.root)
    ) {
      largest = h;
    }
  }

  return {
    total_trees: nonCyclic.length,
    total_cycles: cyclic.length,
    largest_tree_root: largest ? largest.root : "",
  };
}

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "data must be an array" });
    }

    const { validEdges, invalid_entries, duplicate_edges } = parseInput(data);
    const hierarchies = buildHierarchies(validEdges);
    const summary = buildSummary(hierarchies);

    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL,
      hierarchies,
      invalid_entries,
      duplicate_edges,
      summary,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => res.send("BFHL API running. POST to /bfhl"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
