'use strict';

const mongoose = require('mongoose');

// Define Issue Schema
const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true }
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .post(async (req, res) => {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      // Check required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || ''
        });

        const savedIssue = await newIssue.save();

        // Return the issue in the expected format
        return res.json({
          _id: savedIssue._id,
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_by: savedIssue.created_by,
          assigned_to: savedIssue.assigned_to,
          status_text: savedIssue.status_text,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on,
          open: savedIssue.open
        });
      } catch (err) {
        return res.json({ error: 'could not create issue' });
      }
    })

    .get(async (req, res) => {
      const project = req.params.project;
      const filters = { project, ...req.query };

      // Convert 'open' to boolean if present
      if (filters.open !== undefined) {
        filters.open = filters.open === 'true';
      }

      try {
        const issues = await Issue.find(filters, {
          _id: 1,
          issue_title: 1,
          issue_text: 1,
          created_by: 1,
          assigned_to: 1,
          status_text: 1,
          created_on: 1,
          updated_on: 1,
          open: 1
        });

        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not retrieve issues' });
      }
    })

    .put(async (req, res) => {
      const project = req.params.project;
      const { _id, ...fields } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // Remove empty fields and _id from update fields
      const updateFields = {};
      Object.keys(fields).forEach(key => {
        if (fields[key] !== undefined && fields[key] !== '') {
          updateFields[key] = fields[key];
        }
      });

      // Check if there are fields to update
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      // Add updated_on timestamp
      updateFields.updated_on = new Date();

      try {
        // Validate _id format
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.json({ error: 'could not update', _id });
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
          _id,
          updateFields,
          { new: true }
        );

        if (!updatedIssue) {
          return res.json({ error: 'could not update', _id });
        }

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    .delete(async (req, res) => {
      const project = req.params.project;
      const { _id } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        // Validate _id format
        if (!mongoose.Types.ObjectId.isValid(_id)) {
          return res.json({ error: 'could not delete', _id });
        }

        const deletedIssue = await Issue.findByIdAndDelete(_id);

        if (!deletedIssue) {
          return res.json({ error: 'could not delete', _id });
        }

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};