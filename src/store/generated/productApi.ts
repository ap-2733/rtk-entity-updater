/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  User,
  Repository,
  Team,
  Issue,
  Comment,
  PullRequest,
  Commit,
  ReviewThread,
} from "../productApi";
import { type Draft } from "immer";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import { type Api } from "@reduxjs/toolkit/query";
import {
  updateEntityInternal,
  deleteEntityInternal,
  setupMutationListenersInternal,
} from "./utils";

export const queryMap = {
  getUsers: "User[]",
  getUsersSearch: "User[]",
  getUsersById: { user: "User", followers: "User[]", following: "User[]" },
  getUsersByIdRepositories: "Repository[]",
  getUsersByIdTeams: "Team[]",
  getUsersByIdIssues: "Issue[]",
  getUsersByIdPullRequests: "PullRequest[]",
  getRepositories: "Repository[]",
  getRepositoriesSearch: "Repository[]",
  getRepositoriesById: {
    repository: "Repository",
    collaborators: "User[]",
    forks: "Repository[]",
  },
  getRepositoriesByIdStargazers: "User[]",
  getRepositoriesByIdIssues: "Issue[]",
  getRepositoriesByIdPullRequests: "PullRequest[]",
  getRepositoriesByIdCommits: "Commit[]",
  getIssues: "Issue[]",
  getIssuesSearch: "Issue[]",
  getIssuesById: {
    issue: "Issue",
    comments: "Comment[]",
    linkedPullRequests: "PullRequest[]",
  },
  getPullRequests: "PullRequest[]",
  getPullRequestsById: {
    pullRequest: "PullRequest",
    commits: "Commit[]",
    comments: "Comment[]",
  },
  getPullRequestsByIdReviews: "ReviewThread[]",
  getTeams: "Team[]",
  getTeamsById: {
    team: "Team",
    members: "User[]",
    subTeams: "Team[]",
    repositories: "Repository[]",
  },
  getCommitsById: {
    commit: "Commit",
    coAuthors: "User[]",
    pullRequest: "PullRequest",
  },
  getCommentsById: { comment: "Comment", replies: "Comment[]" },
  User: {
    followers: "User[]",
    following: "User[]",
    pinnedRepositories: "Repository[]",
    starredRepositories: "Repository[]",
    teams: "Team[]",
  },
  Repository: {
    owner: "User",
    collaborators: "User[]",
    stargazers: "User[]",
    forks: "Repository[]",
    parentFork: "Repository",
  },
  Team: {
    members: "User[]",
    repositories: "Repository[]",
    subTeams: "Team[]",
    parentTeam: "Team",
  },
  Issue: {
    author: "User",
    assignees: "User[]",
    comments: "Comment[]",
    linkedPullRequests: "PullRequest[]",
    repository: "Repository",
  },
  Comment: { author: "User", replies: "Comment[]", parentComment: "Comment" },
  PullRequest: {
    author: "User",
    reviewers: "User[]",
    commits: "Commit[]",
    comments: "Comment[]",
    resolvedIssues: "Issue[]",
    repository: "Repository",
  },
  Commit: { author: "User", coAuthors: "User[]", pullRequest: "PullRequest" },
  ReviewThread: {
    resolvedBy: "User",
    comments: "Comment[]",
    pullRequest: "PullRequest",
  },
} as const;

export type QueryMap = typeof queryMap;

export const mutationsMap = {
  patchUsersById: "User",
  patchRepositoriesById: "Repository",
  putIssuesById: "Issue",
  patchIssuesById: "Issue",
  putPullRequestsById: "PullRequest",
  patchPullRequestsById: "PullRequest",
} as const;

export type MutationsMap = typeof mutationsMap;

export const entityIdFields = {
  User: "_id",
  Repository: "_id",
  Team: "_id",
  Issue: "_id",
  Comment: "_id",
  PullRequest: "_id",
  Commit: "_id",
  ReviewThread: "_id",
} as const;

export type EntityIdFields = typeof entityIdFields;

export const entityQueries: Record<string, string[]> = {
  User: [
    "getUsers",
    "getUsersSearch",
    "getUsersById",
    "getUsersByIdRepositories",
    "getUsersByIdTeams",
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositories",
    "getRepositoriesSearch",
    "getRepositoriesById",
    "getRepositoriesByIdStargazers",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getTeams",
    "getTeamsById",
    "getCommitsById",
    "getCommentsById",
  ],
  Repository: [
    "getUsers",
    "getUsersSearch",
    "getUsersById",
    "getUsersByIdRepositories",
    "getUsersByIdTeams",
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositories",
    "getRepositoriesSearch",
    "getRepositoriesById",
    "getRepositoriesByIdStargazers",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getTeams",
    "getTeamsById",
    "getCommitsById",
    "getCommentsById",
  ],
  Team: [
    "getUsers",
    "getUsersSearch",
    "getUsersById",
    "getUsersByIdRepositories",
    "getUsersByIdTeams",
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositories",
    "getRepositoriesSearch",
    "getRepositoriesById",
    "getRepositoriesByIdStargazers",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getTeams",
    "getTeamsById",
    "getCommitsById",
    "getCommentsById",
  ],
  Issue: [
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getCommitsById",
  ],
  Comment: [
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getCommitsById",
    "getCommentsById",
  ],
  PullRequest: [
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getCommitsById",
  ],
  Commit: [
    "getUsersByIdIssues",
    "getUsersByIdPullRequests",
    "getRepositoriesByIdIssues",
    "getRepositoriesByIdPullRequests",
    "getRepositoriesByIdCommits",
    "getIssues",
    "getIssuesSearch",
    "getIssuesById",
    "getPullRequests",
    "getPullRequestsById",
    "getPullRequestsByIdReviews",
    "getCommitsById",
  ],
  ReviewThread: ["getPullRequestsByIdReviews"],
};

export const reducerPath = "api" as const;

export function updateEntity(
  entityType: "User",
  id: string | number,
  updater: (entity: Draft<User>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "Repository",
  id: string | number,
  updater: (entity: Draft<Repository>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "Team",
  id: string | number,
  updater: (entity: Draft<Team>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "Issue",
  id: string | number,
  updater: (entity: Draft<Issue>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "Comment",
  id: string | number,
  updater: (entity: Draft<Comment>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "PullRequest",
  id: string | number,
  updater: (entity: Draft<PullRequest>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "Commit",
  id: string | number,
  updater: (entity: Draft<Commit>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: "ReviewThread",
  id: string | number,
  updater: (entity: Draft<ReviewThread>) => void,
): ReturnType<typeof updateEntityInternal>;
export function updateEntity(
  entityType: string,
  id: string | number,
  updater: (entity: Draft<any>) => void,
) {
  return updateEntityInternal(
    entityType,
    id,
    updater,
    reducerPath,
    entityIdFields,
    queryMap,
    entityQueries,
  );
}

export function deleteEntity(
  entityType: "User",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "Repository",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "Team",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "Issue",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "Comment",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "PullRequest",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "Commit",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(
  entityType: "ReviewThread",
  id: string | number,
): ReturnType<typeof deleteEntityInternal>;
export function deleteEntity(entityType: string, id: string | number) {
  return deleteEntityInternal(
    entityType,
    id,
    reducerPath,
    entityIdFields,
    queryMap,
    entityQueries,
  );
}

export function setupMutationListeners(
  listenerMiddleware: ReturnType<typeof createListenerMiddleware>,
  api: Api<any, any, any, any, any>,
) {
  setupMutationListenersInternal(
    listenerMiddleware,
    api,
    entityIdFields,
    mutationsMap,
    reducerPath,
    queryMap,
    entityQueries,
  );
}
