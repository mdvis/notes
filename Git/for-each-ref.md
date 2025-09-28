# for-each-ref
*   \--format='%()'
    
    *   {author,committer,tagger}{name,email,date}
    *   creator{,date} 对应 committer 或 tagger 中的 日期名称或邮件
    
    ```bash
    --format='%(authorname) %(refname)' refs/heads
    ```