from webserver import db

import unittest

class TestStringMethods(unittest.TestCase):

    def test_get_file_url(self):
        filename = "some_file"
        expected_url = f"https://{db.BUCKET}.{db.REGION}.digitaloceanspaces.com/{filename}"
        self.assertEqual(db.get_file_url(filename), expected_url)

    def test_get_key_from_url(self):
        key = "^ak#sd=-a9(21aj)ks.$"
        url = f"https://{db.BUCKET}.{db.REGION}.digitaloceanspaces.com/{key}"
        self.assertEqual(db.get_key_from_url(url), key)

    def test_get_key_from_binary_data(self):
        binary_data = b'some_data'
        similar_binary_data = b'some data'
        self.assertEqual(db.get_key_from_binary_data(binary_data), db.get_key_from_binary_data(binary_data))
        self.assertNotEqual(db.get_key_from_binary_data(binary_data), db.get_key_from_binary_data(similar_binary_data))
        self.assertTrue(isinstance(db.get_key_from_binary_data(binary_data), str))
        self.assertEqual(db.get_key_from_binary_data(binary_data, ".mp3")[-4:], '.mp3')

    def test_check_status(self):
        resp = {'ResponseMetadata': {'HTTPStatusCode': 404}}
        with self.assertRaises(Exception):
            db.check_status(resp, [200], 'test operation')
    
    def test_file_exists(self):
        self.assertTrue(db.file_exists('test_file'))
        self.assertFalse(db.file_exists('dummy_file'))

    def test_get_key(self):
        self.assertEqual(db.get_key(None, 'a_key', '.mp3'), 'a_key')
        data = b'data'
        expected = db.get_key_from_binary_data(data, '.mp3')
        self.assertEqual(db.get_key(data=data, ext='.mp3'), expected)

    def test_add_file_data_file_then_remove(self):
        url = db.add_file(data=b'data')
        self.assertTrue(db.url_exists(url))
        db.remove_file(url)
        self.assertFalse(db.url_exists(url))

    def test_add_file_with_key_then_remove(self):
        url = db.add_file(data=b'data', key='test_temp')
        self.assertTrue(db.url_exists(url))
        self.assertEqual(db.get_key_from_url(url), "test_temp")
        db.remove_file(url)
        self.assertFalse(db.url_exists(url))

    def test_update_file_then_remove(self):
        original_url = db.add_file(data=b'data', key='test_temp')
        self.assertTrue(db.url_exists(original_url))
        new_url = db.update_file(old_url=original_url, data=b'new_data')
        self.assertFalse(db.url_exists(original_url))
        self.assertTrue(db.url_exists(new_url))
        db.remove_file(new_url)
        self.assertFalse(db.url_exists(new_url))
    