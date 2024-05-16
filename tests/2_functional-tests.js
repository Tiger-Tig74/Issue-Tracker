const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let createdIssueId;

  suite('POST /api/issues/{project}', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'TestUser',
          assigned_to: 'TestAssignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'status_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'This is a test issue');
          assert.equal(res.body.created_by, 'TestUser');
          assert.equal(res.body.assigned_to, 'TestAssignee');
          assert.equal(res.body.status_text, 'In Progress');
          createdIssueId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'TestUser'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'issue_title');
          assert.property(res.body, 'issue_text');
          assert.property(res.body, 'created_by');
          assert.property(res.body, 'assigned_to');
          assert.property(res.body, 'status_text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, 'open');
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'This is a test issue');
          assert.equal(res.body.created_by, 'TestUser');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function() {
    test('View issues on a project', function(done) {
        chai.request(server)
          .get('/api/issues/apitest')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body)
            done();
        });
    });
    
    test('View issues on a project with one filter', function(done) {
        chai.request(server)
          .get('/api/issues/apitest?open=true')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isTrue(res.body.every(issue => issue.open));
            done();
        });
    });
  
    test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
          .get('/api/issues/apitest?open=true&assigned_to=TestUser')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isTrue(res.body.every(issue => issue.open && issue.assigned_to === 'TestUser'));
            done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: createdIssueId,
          issue_text: 'Updated issue text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.property(res.body, '_id');
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: createdIssueId,
          issue_text: 'Updated issue text',
          assigned_to: 'Updated Assignee'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.property(res.body, '_id');
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          issue_text: 'Updated issue text'
        })
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: createdIssueId
        })
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: 'invalidId',
          issue_text: 'Updated issue text'
        })
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: createdIssueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, 'result', 'successfully deleted');
          assert.property(res.body, '_id');
          done();
        });
    });

    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: 'invalidId'
        })
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .end(function(err, res) {
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
