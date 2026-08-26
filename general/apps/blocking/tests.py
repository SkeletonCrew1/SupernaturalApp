"""Tests for blocking part of our app"""

import json

from django.test import TestCase

from .models import Banned


class TestReportip(TestCase):
    """This is a class where all the testing is concluded"""

    def setUp(self):  # pylint: disable=invalid-name
        """This is a func where we set up default variables
        in our case we dont need anything but url
        Client() is provided by TestCase import
        """
        self.url = "/api/report/"

    def test_get_reject(self):
        """Test rejection, wrong method from decorator @require_post"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)

    def test_noip_provided(self):
        """Test no ip was provided(empty json)"""
        response = self.client.post(
            self.url, data=json.dumps({}), content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_ip_sent_as_int(self):
        """Test ip was sent as a int instead of str"""
        response = self.client.post(
            self.url,
            data=json.dumps({"ip_address": 123}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_ipv6_or_incorrectip(self):
        """Test if ip provided is incorrect or ipv6 was provided"""
        response = self.client.post(
            self.url,
            data=json.dumps({"ip_address": "2001:0db8:85a3:0000:0000:8a2e:0370:7334"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_empty_ip_provided(self):
        """Test if ip provided is empty"""
        response = self.client.post(
            self.url,
            data=json.dumps({"ip_address": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_ip_exists(self):
        """test if existing ip was provided"""
        Banned.objects.create(ip_address="1.2.3.4")
        response = self.client.post(
            self.url,
            data=json.dumps({"ip_address": "1.2.3.4"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Banned.objects.filter(ip_address="1.2.3.4").count(), 1)
        Banned.objects.filter(ip_address="1.2.3.4").delete()

    def test_someone_banned_successfully(self):
        """Test if correct ip was provided and it is added to banned table"""
        response = self.client.post(
            self.url,
            data=json.dumps({"ip_address": "1.2.3.4"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Banned.objects.filter(ip_address="1.2.3.4").exists())
