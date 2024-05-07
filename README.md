# git-browse

[![JSR](https://jsr.io/badges/@lambdalisue/git-browse)](https://jsr.io/@lambdalisue/git-browse)
[![denoland](https://img.shields.io/github/v/release/lambdalisue/deno-git-browse?logo=deno&label=denoland)](https://deno.land/x/git_browse)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/git_browse/mod.ts)
[![Test](https://github.com/lambdalisue/deno-git-browse/workflows/Test/badge.svg)](https://github.com/lambdalisue/deno-git-browse/actions?query=workflow%3ATest)

Open the URL of the hosting service for the repository using the system web
browser. The following hosting services are currently supported:

- GitHub (https://github.com)
- GitLab (https://gitlab.com)
- Bitbucket (https://bitbucket.org)

See [./hosting_service/services](./hosting_service/services) and create a PR to
support more hosting services.

## Usage

```console
$ browse
#=> Opens a tree page of the current working directory in the HEAD commit of the current branch

$ browse --path=README.md
#=> Opens a blob page of README.md in the HEAD commit of the current branch

$ browse --path=README.md:10
#=> Opens a blob page of README.md with line 10 in the HEAD commit of the current branch

$ browse --path=README.md:10:20
#=> Opens a blob page of README.md with lines 10 to 20 in the HEAD commit of the current branch

$ browse --path=README.md my-awesome-branch
#=> Opens a blob page of README.md in the HEAD commit of my-awesome-branch branch

$ browse --path=README.md fd28fa8
#=> Opens a blob page of README.md in the fd28fa8 commit

$ browse --home
#=> Opens the home page of the repository

$ browse --commit
#=> Opens a commit page of the current branch

$ browse --commit my-awesome-branch
#=> Opens a commit page of my-awesome-branch branch

$ browse --commit fd28fa8
#=> Opens a commit page of fd28fa8 commit

$ browse --pr
#=> Opens a pull request page that contains the HEAD commit of the current branch

$ browse --pr my-awesome-branch
#=> Opens a pull request page that contains the HEAD commit of my-awesome-branch branch

$ browse --pr fd28fa8
#=> Opens a pull request page that contains the fd28fa8 commit
```

## Install

### As a git alias

Add the followings to your `.gitconfig`

```gitconfig
[alias]
  browse = "!deno run --allow-net --allow-run --allow-read --allow-env jsr:@lambdalisue/git-browse/cli"
```

Then use it as `git browse` like

```console
$ git browse --help
```

### As an isolated command

Use `deno install` command to install the command.

```console
$ deno install --allow-net --allow-run --allow-read --allow-env -n browse jsr:@lambdalisue/git-browse/cli
```

Then use it as `browse` like

```console
$ browse --help
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
