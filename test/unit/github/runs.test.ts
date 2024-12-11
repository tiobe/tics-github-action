import { getCurrentStepPath } from '../../../src/github/runs';
import { octokit } from '../../../src/github/octokit';

describe('postReview', () => {
  let listJobsSpy: jest.SpyInstance;

  beforeEach(() => {
    listJobsSpy = jest.spyOn(octokit.rest.actions, 'listJobsForWorkflowRunAttempt');
  });

  test('Should return name when only one step is in progress', async () => {
    listJobsSpy.mockResolvedValue({
      data: {
        jobs: [
          {
            name: 'TICS Client',
            runner_name: 'Github Actions 1',
            status: 'in_progress',
            steps: [
              {
                name: 'Step 1',
                status: 'completed'
              },
              {
                name: 'Step 2',
                status: 'in_progress'
              }
            ]
          },
          {
            name: 'TICS Client',
            runner_name: 'Github Actions 2',
            status: 'completed',
            steps: [
              {
                name: 'Step 1',
                status: 'in_progress'
              },
              {
                name: 'Step 2',
                status: 'in_progress'
              }
            ]
          }
        ]
      }
    });

    const name = await getCurrentStepPath();

    expect(name).toStrictEqual('tics-client / TICS Client / Step 2');
  });

  test('Should not return name when multiple steps are in progress', async () => {
    listJobsSpy.mockResolvedValue({
      data: {
        jobs: [
          {
            name: 'TICS',
            runner_name: 'Github Actions 1',
            status: 'in_progress',
            steps: [
              {
                name: 'Step 1',
                status: 'in_progress'
              },
              {
                name: 'Step 2',
                status: 'in_progress'
              }
            ]
          },
          {
            name: 'TICS',
            runner_name: 'Github Actions 1',
            status: 'completed',
            steps: [
              {
                name: 'Step 1',
                status: 'completed'
              },
              {
                name: 'Step 2',
                status: 'completed'
              }
            ]
          }
        ]
      }
    });

    const name = await getCurrentStepPath();

    expect(name).toStrictEqual('tics-client / TICS / tics-github-action');
  });

  test('Should post a notice on createReview', async () => {
    listJobsSpy.mockRejectedValue(new Error());

    const name = await getCurrentStepPath();

    expect(name).toStrictEqual('tics-client / TICS / tics-github-action');
  });
});
