import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [showPopover, setShowPopover] = useState(false); // Control modal visibility

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-projects'); // Backend API
        const fetchedProjects = await response.json();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setMessage('Failed to fetch projects. Please try again later.');
      }
    };

    fetchProjects();
  }, []); // Empty dependency array for initial fetch

  // Submit handler for project creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const projectData = {
      name: projectName,
      description: projectDescription,
    };

    try {
      const response = await fetch('http://localhost:5000/api/create-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        setMessage('Project created successfully!');
        setProjectName('');
        setProjectDescription('');
        setShowPopover(false); // Close popover after creation

        // Fetch updated projects
        fetchUpdatedProjects();
      } else {
        setMessage('Error: Project could not be created.');
      }
    } catch (error) {
      setMessage('An error occurred: ' + error.message);
    }
  };

  // Function to fetch updated project list
  const fetchUpdatedProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/get-projects');
      const fetchedProjects = await response.json();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching updated projects:', error);
    }
  };

  // Function to handle project deletion
  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        console.log(projectId)
        const response = await fetch(`http://localhost:5000/api/delete-project/${projectId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMessage('Project deleted successfully!');
          // Fetch updated projects after deletion
          fetchUpdatedProjects();
        } else {
          setMessage('Error: Project could not be deleted.');
        }
      } catch (error) {
        setMessage('An error occurred while deleting the project: ' + error.message);
      }
    }
  };

  // Toggle the popover visibility
  const togglePopover = () => {
    setShowPopover(!showPopover);
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <h1>iFusionWare</h1>
      </nav>

      <div className="content-container">
        <button className="create-project-btn" onClick={togglePopover}>
          + Create New Project
        </button>

        {showPopover && (
          <div className="popover">
            <form onSubmit={handleSubmit} className="form-container">
              <h2>Create Project</h2>
              <div className="input-group">
                <label>Project Name:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="input-group">
                <label>Project Description:</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                Create
              </button>
              <button type="button" className="close-btn" onClick={togglePopover}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {message && <p className="message">{message}</p>}

        <h2>Your Projects</h2>
        <div className='project-card-container'>
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project._id || index} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <button className='delete-btn' onClick={() => handleDelete(project.name)}>
                  Delete Project
                </button>
              </div>
            ))
          ) : (
            <p className="no-projects-message">No projects available. Please create one!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
