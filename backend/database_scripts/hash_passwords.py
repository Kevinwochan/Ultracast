from webserver import db
from webserver import app
from webserver import models
from webserver import podcast_engine

if __name__ == "__main__":
    old_password = input("Enter the password you would like to hash: ")
    user_models = models.User.objects(password=old_password)
    print("Found {} users with password {}".format(user_models.count(), old_password))
    if ("yes" == input("type yes to continue: ")):
        hashed_password = podcast_engine.User.hash_password("test")

        user_models.update(set__password=hashed_password)
        print("hashed passwords")
    else:
        print("nope")
