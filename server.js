const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files (including index.html)
app.use(express.static(__dirname));

const dataPath = path.join(__dirname, "data.json");

// Get all projects
app.get("/projects", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataPath));
    res.json(data);
});

// Get single project
app.get("/projects/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataPath));
    const project = data.find((p) => p.project_id == req.params.id);
    res.json(project);
});

// Create new project
app.post("/projects", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataPath));
    const newId = Math.max(...data.map((p) => p.project_id)) + 1;
    const project = { project_id: newId, ...req.body };
    data.push(project);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(project);
});

// Update project
app.put("/projects/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataPath));
    const index = data.findIndex((p) => p.project_id == req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: "Project not found" });
    }

    // Preserve the original project_id and merge with updates
    const updatedProject = {
        ...data[index],
        ...req.body,
        project_id: data[index].project_id, // Ensure ID doesn't change
    };

    data[index] = updatedProject;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(updatedProject);
});
// Delete project
app.delete("/projects/:id", (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataPath));
    const filtered = data.filter((p) => p.project_id != req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2));
    res.json({ message: "Project deleted" });
});

// Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
