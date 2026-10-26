#!/usr/bin/env python3
"""Check updated dates in staged Markdown against Git's committer date."""

import datetime
import re
import subprocess
import sys


def git(*args):
    return subprocess.check_output(["git", *args])


def main():
    # git var respects GIT_COMMITTER_DATE, including its timezone.
    ident = git("var", "GIT_COMMITTER_IDENT").decode().strip()
    epoch, offset = ident.rsplit(" ", 2)[1:]
    minutes = int(offset[1:3]) * 60 + int(offset[3:5])
    if offset[0] == "-":
        minutes = -minutes
    zone = datetime.timezone(datetime.timedelta(minutes=minutes))
    expected = datetime.datetime.fromtimestamp(int(epoch), zone).date().isoformat()

    paths = git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z")
    errors = []
    for raw_path in paths.split(b"\0"):
        if not raw_path:
            continue
        path = raw_path.decode("utf-8", errors="surrogateescape")
        if not path.startswith("content/") or not path.lower().endswith(".md"):
            continue
        # Read the index, so unstaged edits cannot make a stale commit pass.
        content = git("show", ":" + path).decode("utf-8-sig")
        lines = content.splitlines()
        if not lines or lines[0] != "---":
            continue
        for line in lines[1:]:
            if line in ("---", "..."):
                break
            match = re.match(r"^updated\s*:\s*(.*?)\s*$", line)
            if match:
                value = match[1].split(" #", 1)[0].strip().strip("\"'")
                if value != expected:
                    errors.append(f"{path}: updated must be {expected} (found {value!r})")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        print("Update the front matter and stage the file again.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
