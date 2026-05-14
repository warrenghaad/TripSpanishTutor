# Xcode project — generated locally

The Xcode project file is **not committed**. Generate it once on your Mac:

```bash
cd ios/App
# Option 1: XcodeGen (recommended — `brew install xcodegen`)
xcodegen generate

# Option 2: Open Xcode → File → New → Project → iOS App,
#   point at this directory, set bundle ID to com.warrenghaad.tripspanishtutor,
#   add all .swift files from App/ as Compile Sources.
```

A `project.yml` (XcodeGen spec) will land in PR #3 so the project file regenerates
deterministically from version control.
