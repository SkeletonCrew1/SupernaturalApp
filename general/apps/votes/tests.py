"""Tests for votes application."""

import os

import jwt
from django.test import TestCase

from ..authentication.models import User
from .models import Vote, VoteRes

JWT_SECRET = os.getenv("JWT_KEY")


class VoteTestCase(TestCase):
    """Test suite for Vote API operations."""

    def setUp(self):  # pylint: disable=invalid-name
        """Creating new post"""
        self.ben = User.objects.create(
            alias="Ben",
            email="he@gmail.com",
            password="1234",
            status="silver",
            inquisitor=False,
        )
        self.donna = User.objects.create(
            alias="Donna",
            email="she@gmail.com",
            password="1234",
            status="copper",
            inquisitor=False,
        )

        payload = {
            "sub": str(self.ben.id),
            "status": self.ben.status,
        }

        self.token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        if isinstance(self.token, bytes):
            self.token = self.token.decode("utf-8")

        self.client.cookies["jwt"] = self.token

        self.promo = Vote.objects.create(
            type="promotion",
            description="promoting",
            user=self.ben,
            agree=2,
            disagree=0,
        )
        self.ex = Vote.objects.create(
            type="excommunication",
            description="executing",
            user=self.donna,
            agree=2,
            disagree=0,
        )

    def test_set_vote(self):
        """Setting agree vote"""
        url = f"/api/votes/{self.ex.id}/set_vote/"
        data = {"res": "+"}
        response = self.client.post(url, data, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.ex.refresh_from_db()
        self.assertEqual(self.ex.agree, 3)
        self.assertTrue(VoteRes.objects.filter(user=self.ben, vote=self.ex).exists())

    def test_delete_ex_vote(self):
        """Delete excommunication vote"""
        url = f"/api/votes/{self.ex.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Vote.objects.filter(id=self.ex.id).exists())
        self.assertFalse(User.objects.filter(id=self.donna.id).exists())

    def test_delete_promo_vote(self):
        """Delete promo vote"""
        url = f"/api/votes/{self.promo.id}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.ben.refresh_from_db()
        self.assertFalse(Vote.objects.filter(id=self.promo.id).exists())
        self.assertEqual(self.ben.status, "gold")
