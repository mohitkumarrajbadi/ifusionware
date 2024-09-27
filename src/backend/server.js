const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
app.use(cors()); // Enable CORS



app.use(express.json());

const projectDir = path.join(__dirname, 'projects');

// Utility function to delete a directory recursively
const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        deleteFolderRecursive(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

// API to create a project
app.post('/api/create-project', (req, res) => {
    const { name, description } = req.body;
  
    if (!name || !description) {
      return res.status(400).json({ message: 'Project name and description are required.' });
    }
  
    const projectPath = path.join(projectDir, name);
  
    try {
      if (fs.existsSync(projectPath)) {
        return res.status(400).json({ message: 'Project already exists!' });
      }
  
      // Create project directory
      fs.mkdirSync(projectPath, { recursive: true });
  
      // Create pages directory inside the project directory
      const pagesDir = path.join(projectPath, 'pages');
      fs.mkdirSync(pagesDir, { recursive: true });
  
      // Create a directory for the specific page, e.g., 'Home'
      const specificPageDir = path.join(pagesDir, name); // Creates a folder for the specific page
      fs.mkdirSync(specificPageDir, { recursive: true });
  
      // Default files for the specific page
      const defaultFiles = {
        'index.jsx': `import React from 'react';\n\nexport default function ${name}() {\n  return <div>Welcome to ${name}!</div>;\n}\n`,
        'styles.css': `/* Styles for ${name} project */`,
        'index.js': `// Main file for ${name} page\n`,
      };
  
      // Write the default files in the specific page folder
      Object.entries(defaultFiles).forEach(([filename, content]) => {
        fs.writeFileSync(path.join(specificPageDir, filename), content);
      });
  
      res.status(201).json({ message: `Project '${name}' created successfully!` });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: 'Internal server error while creating project.' });
    }
  });
  

// API to get all projects
app.get('/api/get-projects', (req, res) => {
  try {
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ message: 'No projects directory found.' });
    }

    const projects = fs.readdirSync(projectDir).map((projectName) => {
      const projectPath = path.join(projectDir, projectName);
      const descriptionFile = path.join(projectPath, 'description.txt'); // Optional description file

      return {
        name: projectName,
        description: fs.existsSync(descriptionFile) ? fs.readFileSync(descriptionFile, 'utf-8') : 'No description available.',
      };
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error while fetching projects.' });
  }
});

// API to delete a project
app.delete('/api/delete-project/:projectName', (req, res) => {
  const { projectName } = req.params;
  const projectPath = path.join(projectDir, projectName);

  try {
    if (!fs.existsSync(projectPath)) {
      return res.status(404).json({ message: 'Project not found!' });
    }

    // Delete the project directory
    deleteFolderRecursive(projectPath);
    res.json({ message: `Project '${projectName}' deleted successfully!` });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error while deleting project.' });
  }
});

// Global error handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found.' });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
