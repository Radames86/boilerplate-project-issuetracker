'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      try {
        const project = req.params.project;

        const filters = { project: project, ...req.query };

        if (typeof filters.open !== 'undefined') {
          filters.open = String(filters.open).toLowerCase() === 'true';
        }

        const issues = await Issue.find(filters).lean();
        return res.json(issues);
      } catch (err) { console.error('GET /api/issues error:', err);
        return res.status(500).json({ error: 'server error'});
      }
      
      
    })
    
    .post(async function (req, res){
      try {
        const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        project: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        open: true,
        created_on: new Date(),
        updated_on: new Date()
        });

        
      const saved = await newIssue.save();
      return res.json(saved);
      } catch (err) { console.error('POST /api/issues error:', err);
        return res.status(500).json({ error: 'server error' });
      }
    })
    
    .put(async function (req, res){
      try {
        const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

        if (!_id) {
          return res.json({ error: 'missing _id' });
        }

        const updates = {};

        if (issue_title) updates.issue_title = issue_title;
        if (issue_text) updates.issue_text = issue_text;
        if (created_by) updates.created_by = created_by;
        if (assigned_to) updates.assigned_to = assigned_to;
        if (status_text) updates.status_text = status_text;

        if (typeof open !== 'undefined') {
          updates.open = (open === true || open === 'true');
        }

        if (Object.keys(updates).length === 0) {
          return res.json({ error: 'no update field(s) sent', _id: _id });
        }

        updates.updated_on = new Date();

        const updated = await Issue.findByIdAndUpdate(
          _id,
          { $set: updates },
          { new: true }
        );

        if (!updated) {
          return res.json({ error: 'could not update', _id: _id })
        }

        return res.json({ result: 'successfully updated', _id: _id })
      } catch (error) {
        return res.json({ error: 'could not update', _id: req.body._id });
      }
    })
    
    .delete(async function (req, res){
      try {
         const { _id } = req.body;

         if (!_id) {
          return res.json({ error: 'missing _id' });
         }

         const deleted = await Issue.deleteOne({ _id: _id });

         if (!deleted || deleted.deletedCount !== 1) {
          return res.json({ error: 'could not delete', _id: _id });
         }

         return res.json({ result: 'successfully deleted', _id: _id })
      } catch (err) {
        return res.json({ error: 'could not delete', _id: req.body._id });
      }
      
      
    });
    
};
