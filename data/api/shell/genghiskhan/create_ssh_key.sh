ssh-keygen -b 2048 -t rsa -f ~/.ssh/id_rsa -q -N ''
echo "Copy the folowing key into your git repository"
echo
cat ~/.ssh/id_rsa.pub
