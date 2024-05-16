'use strict';

let issues = [];

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      try {
        const project = req.params.project;
        const filters = req.query;

        if (Object.keys(filters).length === 0) {
          const projectIssues = issues.filter(issue => issue.project === project);
          return res.json(projectIssues);
        }

        const filteredIssues = issues.filter(issue => issue.project === project && matchFilters(issue, filters));
        res.json(filteredIssues);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    })
    
    .post(function (req, res){
      try {
        const project = req.params.project;
        const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

        if (!issue_title || !issue_text || !created_by) {
          return res.json({ error: 'required field(s) missing' });
        }

        const issue = {
          _id: generateUniqueId(),
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
          project
        };

        issues.push(issue);
        res.json(issue);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    })
    
    .put(function (req, res){
      try {
        const project = req.params.project;
        const { _id, ...updates } = req.body;

        if (!_id) {
          return res.json({ error: 'missing _id' });
        }

        if (Object.keys(updates).length === 0) {
          return res.json({ error: 'no update field(s) sent', '_id': _id });
        }

        updates.open = (updates.open === 'true')

        updates.updated_on = new Date();

        const issueIndex = issues.findIndex(issue => issue._id === _id && issue.project === project);

        if (issueIndex === -1) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        issues[issueIndex] = { ...issues[issueIndex], ...updates };

        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    })
    
    .delete(function (req, res){
      try {
        const project = req.params.project;
        const { _id } = req.body;

        if (!_id) {
          return res.json({ error: 'missing _id' });
        }

        const issueIndex = issues.findIndex(issue => issue._id === _id && issue.project === project);

        if (issueIndex === -1) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        issues.splice(issueIndex, 1);

        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    });
    
};

function matchFilters(issue, filters) {
  for (const key in filters) {
    const filterValue = key === 'open' ? filters[key] === 'true' : filters[key];
    if (issue[key] !== filterValue) {
      return false;
    }
  }
  return true;
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
