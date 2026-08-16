from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base


Base = declarative_base()


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # Complaint source / customer
    complaint_source = Column(String(100), nullable=True)
    customer_name = Column(String(255), nullable=False)

    # Product / batch
    product_name = Column(String(255), nullable=True)
    product_strength = Column(String(255), nullable=True)
    batch_number = Column(String(100), nullable=True)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity_affected = Column(Float, nullable=True)

    # Complaint
    complaint_type = Column(String(100), nullable=True)
    complaint_date = Column(Date, nullable=True)
    description = Column(Text, nullable=False)

    # Initial classification
    initial_severity = Column(String(50), nullable=True)
    priority = Column(String(50), nullable=True)

    # AI assessment
    overall_risk = Column(String(50), nullable=True)
    confidence_score = Column(Integer, nullable=True)
    potential_impact = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    reasoning = Column(Text, nullable=True)
    completeness_percentage = Column(Integer, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )