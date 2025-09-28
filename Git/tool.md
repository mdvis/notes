# tool
```sh
sudo cp Extras/diffmerge.sh /usr/local/bin/diffmerge
sudo chmod 755 /usr/local/bin/diffmerge
sudo cp Extras/diffmerge.1 /usr/share/man/man1/diffmerge.1
sudo chmod 644 /usr/share/man/man1/diffmerge.1
```

```sh
git config --global diff.tool diffmerge
git config --global difftool.diffmerge.cmd "/usr/local/bin/diffmerge \"\$LOCAL\" \"\$REMOTE\""

git config --global merge.tool diffmerge
git config --global mergetool.diffmerge.trustExitCode true
git config --global mergetool.diffmerge.cmd "/usr/local/bin/diffmerge --merge --result=\"\$MERGED\" \"\$LOCAL\" \"\$BASE\" \"\$REMOTE\""
```