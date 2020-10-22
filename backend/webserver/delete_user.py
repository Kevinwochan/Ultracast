'''
Manually delete an annoying user without authentication
'''
from webserver import podcast_engine

if __name__ == "__main__":
    email = input("Email of the user I shall cleanse")
    check = input("Are you sure you want to cleanse {}? type yes".format(email))
    if check == "yes":
        user = podcast_engine.User.from_email(email)
        print("Deleting user: {}".format(user.to_json()))
        user.delete()
    print("nope")
