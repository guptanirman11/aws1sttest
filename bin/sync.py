from boxsdk import Client, OAuth2
from boxsdk.object.collaboration import CollaborationRole

auth = OAuth2(
    access_token='xaK7V6DVgr6e42V5DkCZO1Rr9dkIkhOM', client_secret=None, client_id='8gn2le1zphpg9pkhvvci0nwrcucca527'
)

client = Client(auth)
homefolder = client.folder(folder_id='126285345459')
items = homefolder.get_items()
for item in items:
    item.delete()
homefolder.upload('files/by_subject.zip')
