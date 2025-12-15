'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const { assert } = chai;
chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);

  const project = 'apitest';
  let testId;
  let testId2;

  test('Create an issue with every field: POST request to /api/issues/{project', function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Title One',
        issue_text: 'Text One',
        created_by: 'User One',
        assigned_to: 'Dev One',
        status_text: 'In QA'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title One');
        assert.equal(res.body.issue_text, 'Text One');
        assert.equal(res.body.created_by, 'User One');
        assert.equal(res.body.assigned_to, 'Dev One');
        assert.equal(res.body.status_text, 'In QA');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');

        testId = res.body._id;
        done()
      });
});

 test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Title Two',
        issue_text: 'Text Two',
        created_by: 'User Two'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, '_id');
        assert.equal(res.body.issue_title, 'Title Two');
        assert.equal(res.body.issue_text, 'Text Two');
        assert.equal(res.body.created_by, 'User Two');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        assert.property(res.body, 'open');

        testId2 = res.body._id;
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Missing Text + Created By'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}?created_by=User%20One`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach((i) => assert.equal(i.created_by, 'User One'));
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get(`/api/issues/${project}?created_by=User%20One&open=true`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach((i) => {
          assert.equal(i.created_by, 'User One');
          assert.equal(i.open, true);
        });
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testId, issue_text: 'Text One Updated' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: testId });
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({
        _id: testId,
        issue_title: 'Title One Updated',
        assigned_to: 'Dev One Updated',
        status_text: 'Done',
        open: false
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully updated', _id: testId });
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ issue_title: 'No ID' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testId })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: testId });
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: 'invalidid', issue_title: 'Bad ID' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not update', _id: 'invalidid' });
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: testId2 })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { result: 'successfully deleted', _id: testId2 });
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: 'invalidid' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'could not delete', _id: 'invalidid' });
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${project}`)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

});
