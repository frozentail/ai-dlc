"""initial

Revision ID: 001
Revises: 
Create Date: 2026-03-18

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'stores',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('identifier', sa.String(100), unique=True, nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        'admins',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('store_id', sa.String(36), sa.ForeignKey('stores.id'), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(200), nullable=False),
        sa.Column('login_attempts', sa.Integer, default=0),
        sa.Column('locked_until', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        'tables',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('store_id', sa.String(36), sa.ForeignKey('stores.id'), nullable=False),
        sa.Column('table_number', sa.Integer, nullable=False),
        sa.Column('password_hash', sa.String(200), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        'table_sessions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('table_id', sa.String(36), sa.ForeignKey('tables.id'), nullable=False),
        sa.Column('started_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('ended_at', sa.DateTime, nullable=True),
        sa.Column('total_amount', sa.Integer, default=0),
    )
    op.create_table(
        'categories',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('store_id', sa.String(36), sa.ForeignKey('stores.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('sort_order', sa.Integer, default=0),
    )
    op.create_table(
        'menus',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('store_id', sa.String(36), sa.ForeignKey('stores.id'), nullable=False),
        sa.Column('category_id', sa.String(36), sa.ForeignKey('categories.id'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('price', sa.Integer, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('image_path', sa.String(500), nullable=True),
        sa.Column('sort_order', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        'orders',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('table_id', sa.String(36), sa.ForeignKey('tables.id'), nullable=False),
        sa.Column('session_id', sa.String(36), sa.ForeignKey('table_sessions.id'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PREPARING', 'COMPLETED', name='orderstatus'), default='PENDING'),
        sa.Column('total_amount', sa.Integer, nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )
    op.create_table(
        'order_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('order_id', sa.String(36), sa.ForeignKey('orders.id'), nullable=False),
        sa.Column('menu_id', sa.String(36), sa.ForeignKey('menus.id'), nullable=False),
        sa.Column('menu_name', sa.String(100), nullable=False),
        sa.Column('unit_price', sa.Integer, nullable=False),
        sa.Column('quantity', sa.Integer, nullable=False),
    )


def downgrade() -> None:
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('menus')
    op.drop_table('categories')
    op.drop_table('table_sessions')
    op.drop_table('tables')
    op.drop_table('admins')
    op.drop_table('stores')
    op.execute("DROP TYPE IF EXISTS orderstatus")
