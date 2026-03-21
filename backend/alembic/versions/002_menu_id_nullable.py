"""order_items menu_id nullable with SET NULL

Revision ID: 002
Revises: 001
Create Date: 2026-03-21

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # FK 제약 조건 제거 후 재생성 (SET NULL 추가)
    op.drop_constraint('order_items_menu_id_fkey', 'order_items', type_='foreignkey')
    op.alter_column('order_items', 'menu_id', nullable=True)
    op.create_foreign_key(
        'order_items_menu_id_fkey',
        'order_items', 'menus',
        ['menu_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('order_items_menu_id_fkey', 'order_items', type_='foreignkey')
    op.alter_column('order_items', 'menu_id', nullable=False)
    op.create_foreign_key(
        'order_items_menu_id_fkey',
        'order_items', 'menus',
        ['menu_id'], ['id']
    )
