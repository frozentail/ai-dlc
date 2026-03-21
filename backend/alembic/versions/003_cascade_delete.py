"""cascade delete for table and session

Revision ID: 003
Revises: 002
Create Date: 2026-03-22

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # table_sessions.table_id → CASCADE
    op.drop_constraint('table_sessions_table_id_fkey', 'table_sessions', type_='foreignkey')
    op.create_foreign_key(
        'table_sessions_table_id_fkey',
        'table_sessions', 'tables',
        ['table_id'], ['id'],
        ondelete='CASCADE'
    )

    # orders.table_id → CASCADE
    op.drop_constraint('orders_table_id_fkey', 'orders', type_='foreignkey')
    op.create_foreign_key(
        'orders_table_id_fkey',
        'orders', 'tables',
        ['table_id'], ['id'],
        ondelete='CASCADE'
    )

    # orders.session_id → CASCADE
    op.drop_constraint('orders_session_id_fkey', 'orders', type_='foreignkey')
    op.create_foreign_key(
        'orders_session_id_fkey',
        'orders', 'table_sessions',
        ['session_id'], ['id'],
        ondelete='CASCADE'
    )

    # order_items.order_id → CASCADE
    op.drop_constraint('order_items_order_id_fkey', 'order_items', type_='foreignkey')
    op.create_foreign_key(
        'order_items_order_id_fkey',
        'order_items', 'orders',
        ['order_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    op.drop_constraint('order_items_order_id_fkey', 'order_items', type_='foreignkey')
    op.create_foreign_key('order_items_order_id_fkey', 'order_items', 'orders', ['order_id'], ['id'])

    op.drop_constraint('orders_session_id_fkey', 'orders', type_='foreignkey')
    op.create_foreign_key('orders_session_id_fkey', 'orders', 'table_sessions', ['session_id'], ['id'])

    op.drop_constraint('orders_table_id_fkey', 'orders', type_='foreignkey')
    op.create_foreign_key('orders_table_id_fkey', 'orders', 'tables', ['table_id'], ['id'])

    op.drop_constraint('table_sessions_table_id_fkey', 'table_sessions', type_='foreignkey')
    op.create_foreign_key('table_sessions_table_id_fkey', 'table_sessions', 'tables', ['table_id'], ['id'])
